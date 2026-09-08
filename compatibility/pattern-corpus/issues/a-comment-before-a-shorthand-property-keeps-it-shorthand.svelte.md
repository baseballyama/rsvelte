# `a-comment-before-a-shorthand-property-keeps-it-shorthand.svelte`

**Issue:** corpus residue

`is_shorthand_object_property` / `is_explicit_property_key` looked at the raw neighbouring characters, so a `/* c */` line between two object entries made `$height` read as a non-shorthand value and lost the shorthand spelling in the generated store read. The `$width` sibling with no comment before it is the control.
