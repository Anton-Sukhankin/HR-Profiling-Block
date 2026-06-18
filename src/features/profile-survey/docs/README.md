# Profile Survey Module Notes

The module is intentionally separate from `profile-ai-assistant`. The survey mutates profile data through explicit user choices and live synchronization with the profile creation form, while AI assistant chat remains consultative.

The final survey action `Заполнить профиль` applies the latest survey result to the visible profile creation form and closes only the survey drawer. It does not create a profile record, close the profile creation drawer, or navigate back to the profiles table.
