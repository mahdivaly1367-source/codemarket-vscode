import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { evaluateChecks, validateCourse, validateRelativePath } from './courseValidation';
import type { CourseDefinition, CourseLesson } from './courseTypes';

const PROGRESS_KEY = 'codemarket.progress.v1';
const MAX_EXERCISE_BYTES = 512 * 1024;

interface WebviewMessage {
  type?: unknown;
  lessonId?: unknown;
}

export class CourseViewProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private selectedLessonId: string;
  private readonly course: CourseDefinition;

  constructor(private readonly context: vscode.ExtensionContext) {
    const coursePath = path.join(context.extensionPath, 'courses', 'javascript-foundations', 'course.json');
    const raw = JSON.parse(fs.readFileSync(coursePath, 'utf8')) as unknown;
    if (!validateCourse(raw)) {
      throw new Error('The bundled CodeMarket course failed validation.');
    }
    this.course = raw;
    this.selectedLessonId = this.course.lessons[0].id;
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: []
    };
    view.webview.html = this.getHtml();
    view.webview.onDidReceiveMessage((message: WebviewMessage) => {
      void this.handleMessage(message);
    }, undefined, this.context.subscriptions);
    view.onDidDispose(() => {
      if (this.view === view) this.view = undefined;
    }, undefined, this.context.subscriptions);
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    if (!message || typeof message.type !== 'string') return;

    switch (message.type) {
      case 'ready':
        this.postState();
        break;
      case 'selectLesson':
        if (typeof message.lessonId === 'string' && this.getLesson(message.lessonId)) {
          this.selectedLessonId = message.lessonId;
          this.postState();
        }
        break;
      case 'openExercise':
        await this.openExercise();
        break;
      case 'checkSolution':
        await this.checkSolution();
        break;
    }
  }

  private getLesson(lessonId: string): CourseLesson | undefined {
    return this.course.lessons.find((lesson) => lesson.id === lessonId);
  }

  private getCompletedIds(): string[] {
    const stored = this.context.globalState.get<unknown>(PROGRESS_KEY, []);
    if (!Array.isArray(stored)) return [];
    const validIds = new Set(this.course.lessons.map((lesson) => lesson.id));
    return stored.filter((value): value is string => typeof value === 'string' && validIds.has(value));
  }

  private postState(): void {
    const lesson = this.getLesson(this.selectedLessonId);
    void this.view?.webview.postMessage({
      type: 'state',
      course: {
        title: this.course.title,
        programmingLanguage: this.course.programmingLanguage,
        contentLocale: this.course.contentLocale,
        description: this.course.description,
        lessons: this.course.lessons.map(({ id, title, goal, exercisePath }) => ({ id, title, goal, exercisePath }))
      },
      lesson,
      completedIds: this.getCompletedIds()
    });
  }

  private async getWorkspaceRoot(): Promise<vscode.Uri | undefined> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      await vscode.window.showWarningMessage('ابتدا یک پوشهٔ پروژه را در VS Code باز کن.');
      return undefined;
    }
    return folder.uri;
  }

  private async resolveSafeWorkspacePath(root: vscode.Uri, relativePath: string, createParents: boolean): Promise<vscode.Uri> {
    if (!validateRelativePath(relativePath)) {
      throw new Error('مسیر فایل تمرین نامعتبر است.');
    }

    const segments = relativePath.split('/');
    let current = root;

    for (let index = 0; index < segments.length; index += 1) {
      current = vscode.Uri.joinPath(current, segments[index]);
      const isLast = index === segments.length - 1;
      let stat: vscode.FileStat;

      try {
        stat = await vscode.workspace.fs.stat(current);
      } catch (error) {
        if (!isFileNotFound(error)) throw error;
        if (isLast) break;
        if (!createParents) throw new Error('پوشهٔ تمرین پیدا نشد. ابتدا فایل تمرین را ایجاد کن.');
        await vscode.workspace.fs.createDirectory(current);
        continue;
      }

      if ((stat.type & vscode.FileType.SymbolicLink) !== 0) {
        throw new Error('برای امنیت، مسیر تمرین نمی‌تواند از پیوند نمادین عبور کند.');
      }
      if (!isLast && (stat.type & vscode.FileType.Directory) === 0) {
        throw new Error('یکی از پوشه‌های مسیر تمرین، پوشهٔ معتبر نیست.');
      }
      if (isLast && (stat.type & vscode.FileType.Directory) !== 0) {
        throw new Error('مسیر تمرین به‌جای فایل، یک پوشه است.');
      }
    }

    return current;
  }

  private async openExercise(): Promise<void> {
    const lesson = this.getLesson(this.selectedLessonId);
    const root = await this.getWorkspaceRoot();
    if (!lesson || !root) return;

    try {
      const fileUri = await this.resolveSafeWorkspacePath(root, lesson.exercisePath, true);
      try {
        const stat = await vscode.workspace.fs.stat(fileUri);
        if ((stat.type & vscode.FileType.SymbolicLink) !== 0) {
          throw new Error('فایل تمرین نمی‌تواند پیوند نمادین باشد.');
        }
      } catch (error) {
        if (!isFileNotFound(error)) throw error;
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(lesson.starterCode, 'utf8'));
      }

      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
      await vscode.window.showErrorMessage(errorMessage(error));
    }
  }

  private async checkSolution(): Promise<void> {
    const lesson = this.getLesson(this.selectedLessonId);
    const root = await this.getWorkspaceRoot();
    if (!lesson || !root || !this.view) return;

    try {
      const fileUri = await this.resolveSafeWorkspacePath(root, lesson.exercisePath, false);
      let stat: vscode.FileStat;
      try {
        stat = await vscode.workspace.fs.stat(fileUri);
      } catch (error) {
        if (isFileNotFound(error)) {
          throw new Error('فایل تمرین پیدا نشد؛ ابتدا «ایجاد / بازکردن فایل تمرین» را بزن.');
        }
        throw error;
      }
      if (stat.size > MAX_EXERCISE_BYTES) {
        throw new Error('فایل تمرین بیش از اندازه بزرگ است؛ محدودیت این نسخه ۵۱۲ کیلوبایت است.');
      }
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      if (bytes.byteLength > MAX_EXERCISE_BYTES) {
        throw new Error('فایل تمرین هنگام خواندن از محدودیت اندازه عبور کرد.');
      }
      const source = Buffer.from(bytes).toString('utf8');
      const results = evaluateChecks(source, lesson.checks);
      const passed = results.length > 0 && results.every((result) => result.passed);
      let completedIds = this.getCompletedIds();

      if (passed && !completedIds.includes(lesson.id)) {
        completedIds = [...completedIds, lesson.id];
        await this.context.globalState.update(PROGRESS_KEY, completedIds);
      }

      await this.view.webview.postMessage({
        type: 'checkResult',
        lessonId: lesson.id,
        passed,
        results,
        completedIds
      });
    } catch (error) {
      await vscode.window.showWarningMessage(errorMessage(error));
    }
  }

  private getHtml(): string {
    const nonce = createNonce();
    const csp = `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';`;

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>CodeMarket</title>
  <style nonce="${nonce}">
    :root { color-scheme: light dark; }
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 0 12px 18px; font-size: var(--vscode-font-size); }
    .brand { display:flex; align-items:center; gap:9px; margin: 10px 0 4px; }
    .brand-mark { width:25px; height:25px; border-radius:7px; display:grid; place-items:center; background:var(--vscode-button-background); color:var(--vscode-button-foreground); font-weight:700; }
    h1 { font-size:17px; margin:0; }
    h2 { font-size:15px; line-height:1.4; margin:15px 0 7px; }
    p { line-height:1.6; }
    .muted { color:var(--vscode-descriptionForeground); font-size:12px; }
    #course-meta { direction:ltr; text-align:left; }
    .progress-track { width:100%; height:5px; background:var(--vscode-panel-border); border-radius:5px; overflow:hidden; margin:8px 0 4px; }
    .progress-fill { width:0; height:100%; background:var(--vscode-testing-iconPassed); transition:width .15s ease; }
    #lesson-list { display:grid; gap:6px; padding:0; margin:12px 0; list-style:none; }
    .lesson-button { display:block; width:100%; text-align:right; padding:9px; color:var(--vscode-foreground); background:var(--vscode-sideBar-background); border:1px solid var(--vscode-panel-border); border-radius:5px; cursor:pointer; }
    .lesson-button[aria-current="true"] { border-color:var(--vscode-focusBorder); }
    .lesson-button strong { display:block; font-size:12px; line-height:1.5; }
    .lesson-button small { display:block; margin-top:3px; color:var(--vscode-descriptionForeground); line-height:1.4; }
    .lesson-button .done { color:var(--vscode-testing-iconPassed); }
    .card { border-top:1px solid var(--vscode-panel-border); padding-top:8px; margin-top:14px; }
    .steps { padding-inline-start:20px; line-height:1.7; }
    code, pre { font-family:var(--vscode-editor-font-family); }
    code { overflow-wrap:anywhere; }
    .path { display:block; direction:ltr; text-align:left; border:1px solid var(--vscode-panel-border); border-radius:4px; padding:6px; font-size:11px; overflow-wrap:anywhere; }
    .actions { display:grid; gap:7px; margin:13px 0; }
    button.action { width:100%; padding:7px 10px; border-radius:3px; border:1px solid var(--vscode-button-border, transparent); background:var(--vscode-button-background); color:var(--vscode-button-foreground); cursor:pointer; }
    button.action.secondary { background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); }
    button:focus-visible { outline:1px solid var(--vscode-focusBorder); outline-offset:2px; }
    #result { padding:9px; border-radius:4px; border:1px solid var(--vscode-panel-border); white-space:normal; overflow-wrap:anywhere; }
    #result.success { border-color:var(--vscode-testing-iconPassed); }
    #result.failure { border-color:var(--vscode-testing-iconFailed); }
    #result ul { padding-inline-start:19px; line-height:1.6; }
    .security-note { font-size:11px; color:var(--vscode-descriptionForeground); border-top:1px solid var(--vscode-panel-border); padding-top:10px; line-height:1.6; }
    [hidden] { display:none !important; }
  </style>
</head>
<body>
  <div class="brand"><div class="brand-mark">C</div><div><h1>CodeMarket</h1><div class="muted">یادگیری تعاملی در VS Code</div></div></div>
  <p id="course-description" class="muted">در حال بارگذاری دوره…</p>
  <div id="course-meta" class="muted"></div>
  <div id="progress-label" class="muted">پیشرفت: ۰ از ۰ درس</div>
  <div class="progress-track" aria-hidden="true"><div id="progress-fill" class="progress-fill"></div></div>
  <ul id="lesson-list" aria-label="فهرست درس‌ها"></ul>

  <section id="lesson-panel" class="card" hidden>
    <div id="lesson-number" class="muted"></div>
    <h2 id="lesson-title"></h2>
    <p id="lesson-goal"></p>
    <div id="lesson-content"></div>
    <h2>مراحل تمرین</h2>
    <ol id="lesson-steps" class="steps"></ol>
    <h2>فایل تمرین</h2>
    <code id="exercise-path" class="path"></code>
    <div class="actions">
      <button class="action" id="open-exercise">ایجاد / بازکردن فایل تمرین</button>
      <button class="action secondary" id="check-solution">بررسی پاسخ من</button>
    </div>
    <div id="result" role="status" aria-live="polite" hidden></div>
  </section>
  <p class="security-note">امنیت نسخهٔ اولیه: کد هنرجو اجرا نمی‌شود. بررسی فعلی فقط عبارت‌های متنی مشخص را می‌سنجد و هنوز آزمون معنایی کامل نیست.</p>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const el = (id) => document.getElementById(id);
    let model = null;
    let selectedLessonId = null;
    let completedIds = [];

    function send(type, extra = {}) { vscode.postMessage({ type, ...extra }); }

    function setText(id, value) { el(id).textContent = String(value ?? ''); }

    function renderState(next) {
      model = next;
      selectedLessonId = next.lesson?.id ?? null;
      completedIds = Array.isArray(next.completedIds) ? next.completedIds : [];
      setText('course-description', next.course.description);
      setText('course-meta', next.course.programmingLanguage + ' · ' + next.course.contentLocale);
      const total = next.course.lessons.length;
      setText('progress-label', 'پیشرفت: ' + completedIds.length + ' از ' + total + ' درس');
      el('progress-fill').style.width = (total ? Math.min(100, completedIds.length / total * 100) : 0) + '%';

      const list = el('lesson-list');
      list.replaceChildren();
      next.course.lessons.forEach((lesson, index) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lesson-button';
        button.dataset.lessonId = lesson.id;
        button.setAttribute('aria-current', String(lesson.id === selectedLessonId));
        const title = document.createElement('strong');
        title.textContent = (completedIds.includes(lesson.id) ? '✓ ' : '') + (index + 1) + '. ' + lesson.title;
        if (completedIds.includes(lesson.id)) title.className = 'done';
        const goal = document.createElement('small');
        goal.textContent = lesson.goal;
        button.append(title, goal);
        item.append(button);
        list.append(item);
      });

      const lesson = next.lesson;
      el('lesson-panel').hidden = !lesson;
      if (!lesson) return;
      const index = next.course.lessons.findIndex((item) => item.id === lesson.id) + 1;
      setText('lesson-number', 'درس ' + index + ' از ' + total + (completedIds.includes(lesson.id) ? ' · تکمیل‌شده' : ''));
      setText('lesson-title', lesson.title);
      setText('lesson-goal', lesson.goal);
      setText('lesson-content', lesson.content);
      setText('exercise-path', lesson.exercisePath);
      const steps = el('lesson-steps');
      steps.replaceChildren();
      lesson.steps.forEach((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      });
      el('result').hidden = true;
      el('result').className = '';
      el('result').replaceChildren();
    }

    el('lesson-list').addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest('button[data-lesson-id]');
      if (button) send('selectLesson', { lessonId: button.dataset.lessonId });
    });
    el('open-exercise').addEventListener('click', () => send('openExercise'));
    el('check-solution').addEventListener('click', () => send('checkSolution'));

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (!message || typeof message.type !== 'string') return;
      if (message.type === 'state') renderState(message);
      if (message.type === 'checkResult') {
        completedIds = Array.isArray(message.completedIds) ? message.completedIds : completedIds;
        const result = el('result');
        result.replaceChildren();
        result.hidden = false;
        result.className = message.passed ? 'success' : 'failure';
        const heading = document.createElement('strong');
        heading.textContent = message.passed ? 'آفرین! این تمرین از بررسی اولیه عبور کرد.' : 'هنوز چند مورد باقی مانده است.';
        result.append(heading);
        const list = document.createElement('ul');
        (Array.isArray(message.results) ? message.results : []).forEach((item) => {
          const li = document.createElement('li');
          li.textContent = (item.passed ? '✓' : '•') + ' ' + item.message;
          list.append(li);
        });
        result.append(list);
        if (model) renderState({ ...model, completedIds });
        result.hidden = false;
        result.className = message.passed ? 'success' : 'failure';
        result.replaceChildren(heading, list);
      }
    });

    send('ready');
  </script>
</body>
</html>`;
  }
}

function createNonce(): string {
  return randomBytes(18).toString('base64');
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof vscode.FileSystemError && error.code === 'FileNotFound';
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطای ناشناخته‌ای رخ داد.';
}
