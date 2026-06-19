# Profile Survey Module Notes

The module is intentionally separate from `profile-ai-assistant`. The survey mutates profile data only for a concrete typical-role template through explicit user choices and live synchronization with the profile creation form. The non-typical path remains a language/helper interface and does not fill the profile creation form.

The final survey action `Применить` keeps the typical synchronized draft in the visible profile creation form or, for non-typical, closes the drawer without writing survey answers into the form. It does not create a profile record, close the profile creation drawer, or navigate back to the profiles table.
