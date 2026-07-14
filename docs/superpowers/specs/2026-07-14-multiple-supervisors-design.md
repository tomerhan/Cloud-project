# Multiple Supervisors per Student — Design

Date: 2026-07-14
Status: Approved

## Goal

Allow each student to have more than one supervising lecturer. Today the User
model holds a single `supervisor` ObjectId + `supervisorStatus`; the student
can only ever have one pending/approved supervisor.

## Data model (backend_web)

Replace the single fields with an array on the User schema:

```js
supervisors: [{
  lecturer: { type: ObjectId, ref: 'User' },
  status:   { type: String, enum: ['pending', 'approved'], default: 'pending' },
}]
```

- Rejection / cancellation removes the entry (mirrors today's behavior where
  reject nulls the field). No cap on the number of supervisors.
- Legacy fields `supervisor` / `supervisorStatus` stay in the schema but are
  lazily migrated: on profile read, a non-null legacy `supervisor` with status
  pending/approved is folded into `supervisors` once and the legacy fields
  cleared.

## API (userController / userRoutes)

- `GET /users/profile` — populates `supervisors.lecturer` (name, email,
  institution); performs the lazy migration.
- `POST /users/request-supervisor` — pushes `{ lecturer, status: 'pending' }`.
  409-style error if that lecturer is already pending/approved for the student.
- `PUT /users/accept-student/:id` — finds the entry for the calling lecturer in
  the student's `supervisors`, sets `status: 'approved'`.
- `PUT /users/reject-student/:id` — removes the calling lecturer's entry.
- **New** `DELETE /users/cancel-supervisor-request/:lecturerId` — student
  removes their own *pending* entry only (approved entries can only be removed
  by the lecturer via reject).
- `GET /users/students` — `$elemMatch` query on `supervisors` for the calling
  lecturer with status pending/approved; per-student status comes from that
  entry. External shape unchanged, so the lecturer dashboard and
  accept/reject UI keep working as-is.

## Frontend (Cloud-project, RegisterCourses.tsx)

- Replace the single status banner with a **"My supervisors" list**: approved
  entries (green) and pending entries (amber, with a cancel button).
- The lecturer search + request form is always visible, regardless of how many
  supervisors exist.
- Requesting a lecturer already in the list surfaces the server error.
- All screen texts move to translations.ts (en + he) — the screen is currently
  hard-coded English.

## Out of scope

- Lecturer-side screens (ManageCourses, dashboard) — unchanged, they consume
  `GET /users/students` which keeps its shape.
- No notification/email on request or approval.
