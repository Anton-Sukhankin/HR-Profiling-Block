# Profile Survey Business Rules

- The survey is optional and must not block manual profile creation.
- The survey does not change profile form values until `Применить и закрыть`.
- If the user exits before applying, the manual form returns unchanged while survey answers remain in memory.
- `Основная функция должности` and `Укажите конкретное функциональное направление` are required for moving past the first survey step.
- If no function or functional direction matches the typed query, the dropdown shows only `Новое значение`.
- A newly added function immediately becomes selected and is shown as a custom value with status `на верификации`.
- A newly added functional direction immediately becomes selected and is stored in the local survey state.
- Custom functions and custom functional directions can be deleted from their dropdown lists. If the deleted value was selected, the corresponding survey answer is cleared.
- If a selected function has typical roles, the block `Доступные готовые шаблоны должностей` appears below the function field.
- Choosing a typical role enables the shortcut scenario to the final step.
- If the user rejects a typical profile, the selected template is reset and the user returns to the manual survey path.
- Stage 2 values may be filled by the survey only after the first-stage draft is formed and applied.
