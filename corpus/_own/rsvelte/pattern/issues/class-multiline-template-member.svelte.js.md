# `class-multiline-template-member.svelte.js`

**Issue:** corpus residue

A multi-line template literal inside a class body is one member. The line-based split asks `js_scan::line_starts_outside_opaque` once, so a string, template, regex or comment continuation is judged by the predicate the rest of the tree uses; re-emitting the member blocks otherwise lands a blank line inside the template and changes its value.
