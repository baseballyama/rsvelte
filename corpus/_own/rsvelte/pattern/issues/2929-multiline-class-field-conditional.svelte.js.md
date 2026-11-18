# `2929-multiline-class-field-conditional.svelte.js`

**Issue:** [#2929](https://github.com/baseballyama/rsvelte/issues/2929)

A private `$state` class field followed by a multiline conditional class-field initializer. The module class-field pipeline must preserve the initializer as one expression in both production and dev output; splitting before `?` leaves a bare conditional branch and invalid JavaScript.
