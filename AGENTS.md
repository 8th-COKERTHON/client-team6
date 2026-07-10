<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## File Change Reporting

Before creating or modifying any file, report the planned work scope, the files that will be created or modified, and the intended contents or changes to the user. Proceed with the file creation or modification only after that report has been provided.

## Commit Discipline

After each task is completed, automatically create a git commit. Include only the files directly related to that task, and leave unrelated or incidental changes unstaged. Keep each commit atomic, representing one coherent unit of work. Use a clear commit-message prefix, such as `docs:`, `feat:`, `fix:`, `chore:`, `refactor:`, or `test:`, that matches the task.

## UI Verification

When working on UI changes, skip the step of launching a browser or performing browser-based visual verification. Prefer code review, linting, type checking, builds, and other non-browser validation unless the user explicitly requests browser verification.
