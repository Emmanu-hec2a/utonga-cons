# Production-Ready Staff Security & First-Time Login

This plan addresses a critical logic error in the staff login flow where `last_login` was not being updated, causing superusers to be trapped in a "needs password change" loop. It also extends the first-time password change requirement to all staff users.

## User Review Required

> [!NOTE]
> The "First-time Login" password change will now apply to **all** staff (not just superusers) if their `last_login` is `None`. This is a best practice for onboarding new team members with temporary passwords.

## Proposed Changes

### Backend Security Logic

#### [admin_views.py](file:///C:/Users/PC/Desktop/Utonga/backend/core/admin_views.py)

- Import `update_last_login` to ensure the timestamp is recorded upon token creation.
- Update `admin_login` to trigger the `last_login` update.
- Extend `needs_password_change` to any user with `last_login is None`.
- Add audit logging to `admin_change_password`.

```python
from django.contrib.auth.models import User, update_last_login

# In admin_login:
user = authenticate(request, username=username, password=password)
if user is not None:
    needs_password_change = user.last_login is None  # Check BEFORE updating last_login
    update_last_login(None, user)  # Mark this login
    # ... rest of the logic
```

---

### Frontend UI & Validation

#### [ChangePassword.jsx](file:///C:/Users/PC/Desktop/Utonga/frontend/src/pages/Staff/ChangePassword.jsx)

- Add password length validation (minimum 8 characters).
- Improve error handling and loading states.

#### [App.jsx](file:///C:/Users/PC/Desktop/Utonga/frontend/src/App.jsx)

- Verify the `ProtectedRoute` correctly manages the `needsPasswordChange` state.

## Verification Plan

### Automated Tests
- Run `python manage.py test core.tests` (if tests exist) to ensure no regressions in auth.

### Manual Verification
1. **Initial Login**: Create a new user (Staff or Superuser) via `createsuperuser` or Django Admin.
2. **First Login**: Log in at `/staff/login`. Verify it redirects to `/staff/change-password`.
3. **Password Change**: Enter a new password. Verify it redirects to `/staff/dashboard`.
4. **Subsequent Login**: Log out and log back in. Verify it goes **directly** to `/staff/dashboard` (proving `last_login` was updated).
5. **Validation**: Attempt to set a 4-character password; verify the frontend blocks it.
