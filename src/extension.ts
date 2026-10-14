import * as vscode from 'vscode';
import { CourseViewProvider } from './courseViewProvider';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new CourseViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('codemarket.courseView', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode.commands.registerCommand('codemarket.openCourse', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.codemarket');
    })
  );
}

export function deactivate(): void {
  // No background processes are started by this extension.
}
