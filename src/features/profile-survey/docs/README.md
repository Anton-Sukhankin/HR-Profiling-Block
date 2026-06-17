# Profile Survey Module Notes

The module is intentionally separate from `profile-ai-assistant`. The survey mutates profile data through explicit user choices and live synchronization with the profile creation form, while AI assistant chat remains consultative.

The final survey action `Создать профиль` reuses the normal profile creation flow: it applies the latest survey result, creates a profile in the profiles table, closes the survey and profile creation drawers, and shows the success notification.
