# Student vs Lecturer Paper Distinction — Design

Date: 2026-07-14
Status: Approved

## Goal

Visually distinguish papers uploaded by a lecturer ("course material") from
papers uploaded by students, and let users filter lists by uploader.

## Backend (backend_web)

- `GET /papers` populates `uploadedBy` (name, role) and returns per paper:
  `uploaderRole` ('student' | 'lecturer'), `uploaderName`, `isMine`
  (uploadedBy equals the calling user). No schema change — `uploadedBy` is
  already stored.

## Frontend (Cloud-project)

- `Article` interface: optional `uploaderRole`, `uploaderName`, `isMine`.
- `paperService.getPapers` maps the new fields.
- Badges on every paper card in Library and Research Chat:
  - Lecturer upload → "Course material" badge (indigo) + lecturer name.
  - Own upload → "My upload" badge.
  - Another student's upload → neutral badge with uploader name.
- Filter segmented control (All / Course materials / Mine) next to the search
  in both Library and the Research Chat paper list.
- Translations en + he.

## Out of scope

- Visibility scoping (everyone still sees all papers).
