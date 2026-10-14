import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateChecks, validateCourse, validateRelativePath } from '../src/courseValidation';
import type { CourseDefinition } from '../src/courseTypes';
import fs from 'node:fs';
import path from 'node:path';

const coursePath = path.join(process.cwd(), 'courses', 'javascript-foundations', 'course.json');
const sampleCourse = JSON.parse(fs.readFileSync(coursePath, 'utf8')) as CourseDefinition;

test('bundled sample course follows the current schema', () => {
  assert.equal(validateCourse(sampleCourse), true);
});

test('course rejects path traversal and platform-specific absolute paths', () => {
  for (const invalid of ['../secret.txt', 'lesson/../../secret', '/etc/passwd', 'C:/Windows/win.ini', 'folder\\file.js', 'folder//file.js', './file.js']) {
    assert.equal(validateRelativePath(invalid), false, `Expected rejection for ${invalid}`);
  }
  assert.equal(validateRelativePath('codemarket-exercises/01-greeting.js'), true);
});

test('course rejects duplicate lesson ids and duplicate exercise paths', () => {
  const duplicateId = structuredClone(sampleCourse);
  duplicateId.lessons[1].id = duplicateId.lessons[0].id;
  assert.equal(validateCourse(duplicateId), false);

  const duplicatePath = structuredClone(sampleCourse);
  duplicatePath.lessons[1].exercisePath = duplicatePath.lessons[0].exercisePath;
  assert.equal(validateCourse(duplicatePath), false);
});

test('static checks report missing literal requirements and TODO markers', () => {
  const results = evaluateChecks('function greet(name) { return "TODO"; }', [
    { type: 'containsAll', values: ['function greet', 'Hello,'] },
    { type: 'doesNotContain', value: 'TODO' }
  ]);
  assert.equal(results.length, 2);
  assert.equal(results[0].passed, false);
  assert.match(results[0].message, /Hello/);
  assert.equal(results[1].passed, false);
});

test('static checks pass for the sample greeting solution', () => {
  const source = 'function greet(name) { return `Hello, ${name}!`; }';
  const lesson = sampleCourse.lessons[0];
  assert.deepEqual(evaluateChecks(source, lesson.checks).map((item) => item.passed), [true, true]);
});

test('unknown executable check types are rejected', () => {
  const unsafe = structuredClone(sampleCourse) as unknown as { lessons: Array<{ checks: Array<Record<string, unknown>> }> };
  unsafe.lessons[0].checks[0] = { type: 'runShell', command: 'echo unsafe' };
  assert.equal(validateCourse(unsafe), false);
});
