export type CourseCheck =
  | {
      type: 'containsAll';
      values: string[];
      label?: string;
    }
  | {
      type: 'doesNotContain';
      value: string;
      label?: string;
    };

export interface CourseLesson {
  id: string;
  title: string;
  goal: string;
  content: string;
  steps: string[];
  exercisePath: string;
  starterCode: string;
  checks: CourseCheck[];
}

export interface CourseDefinition {
  schemaVersion: 1;
  id: string;
  title: string;
  language: string;
  description: string;
  lessons: CourseLesson[];
}

export interface CheckResult {
  passed: boolean;
  message: string;
}

export interface LessonProgress {
  completedLessonIds: string[];
}
