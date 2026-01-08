---
"api": minor
"apimanager": minor
---

Add user management system with profile and admin features

- Add users API router with profile endpoints (GET/PUT /users/me)
- Add password change endpoint (PUT /users/me/password)
- Add avatar upload endpoint (POST /users/me/avatar)
- Add admin-only user management endpoints (list, create, delete, role update)
- Add profile page with avatar upload and settings
- Add user management page for admins with role assignment
- Add grid background component for authenticated pages
- Add shared AppNavbar with user dropdown menu
- Add Phosphor Icons for consistent UI iconography
