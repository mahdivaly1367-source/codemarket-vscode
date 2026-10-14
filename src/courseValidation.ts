import type { CourseCheck, CourseDefinition, CourseLesson, CheckResult } from './courseTypes';

const MAX_LESSONS = 100;
const MAX_TEXT_LENGTH = 20_000;
const MAX_STARTER_LENGTH = 300_000;
const MAX_CHECKS_PER_LESSON = 30;
const MAX_VALUES_PER_CHECK = 25;
const MAX_CHECK_VALUE_LENGTH = 500;

export function validateRelativePath(relativePath: string): boolean {
  if (!relativePath || relativePath.length > 240) return false;
  if (relativePath.startsWith('/') || relativePath.includes('\\') || relativePath.includes(':')) return false;
  if (/^[A-Za-z]:/.test(relativePath) || /[\u0000-\u001f]/.test(relativePath)) return false;

  const segments = relativePath.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return false;
  return segments.every((segment) => /^[A-Za-z0-9._-]+$/.test(segment));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength = MAX_TEXT_LENGTH): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function validateCheck(value: unknown): value is CourseCheck {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  if (value.label !== undefined && !isText(value.label, 1_000)) return false;

  if (value.type === 'containsAll') {
    return Array.isArray(value.values)
      && value.values.length > 0
      && value.values.length <= MAX_VALUES_PER_CHECK
      && value.values.every((item) => isText(item, MAX_CHECK_VALUE_LENGTH));
  }

  if (value.type === 'doesNotContain') {
    return isText(value.value, MAX_CHECK_VALUE_LENGTH);
  }

  return false;
}

function validateLesson(value: unknown): value is CourseLesson {
  if (!isRecord(value)) return false;
  return isText(value.id, 100)
    && /^[a-z0-9][a-z0-9-]*$/.test(value.id)
    && isText(value.title, 200)
    && isText(value.goal, 500)
    && isText(value.content, MAX_TEXT_LENGTH)
    && Array.isArray(value.steps)
    && value.steps.length > 0
    && value.steps.length <= 30
    && value.steps.every((step) => isText(step, 2_000))
    && typeof value.exercisePath === 'string'
    && validateRelativePath(value.exercisePath)
    && typeof value.starterCode === 'string'
    && value.starterCode.length <= MAX_STARTER_LENGTH
    && Array.isArray(value.checks)
    && value.checks.length > 0
    && value.checks.length <= MAX_CHECKS_PER_LESSON
    && value.checks.every(validateCheck);
}

export function validateCourse(value: unknown): value is CourseDefinition {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== 1) return false;
  if (!isText(value.id, 100) || !/^[a-z0-9][a-z0-9-]*$/.test(value.id)) return false;
  if (!isText(value.title, 200) || !isText(value.programmingLanguage, 80) || !/^[a-z0-9][a-z0-9-]*$/.test(value.programmingLanguage)) return false;
  if (!isText(value.contentLocale, 35) || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value.contentLocale)) return false;
  if (!isText(value.description, 2_000)) return false;
  if (!Array.isArray(value.lessons) || value.lessons.length === 0 || value.lessons.length > MAX_LESSONS) return false;
  if (!value.lessons.every(validateLesson)) return false;

  const lessonIds = value.lessons.map((lesson) => lesson.id);
  const exercisePaths = value.lessons.map((lesson) => lesson.exercisePath.toLowerCase());
  return new Set(lessonIds).size === lessonIds.length
    && new Set(exercisePaths).size === exercisePaths.length;
}

export function evaluateChecks(content: string, checks: CourseCheck[]): CheckResult[] {
  return checks.map((check): CheckResult => {
    if (check.type === 'containsAll') {
      const missing = check.values.filter((value) => !content.includes(value));
      if (missing.length === 0) {
        return { passed: true, message: check.label ?? 'عبارت‌های لازم پیدا شدند.' };
      }
      return {
        passed: false,
        message: `${check.label ?? 'این عبارت‌ها در فایل پیدا نشدند'}: ${missing.map((item) => `«${item}»`).join('، ')}`
      };
    }

    if (content.includes(check.value)) {
      return {
        passed: false,
        message: check.label ?? `عبارت «${check.value}» هنوز در فایل وجود دارد.`
      };
    }

    return { passed: true, message: check.label ?? 'عبارت اولیه حذف شده است.' };
  });
}
