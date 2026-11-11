<button class="tile u" data-k="v" aria-label="tile">
	<i></i>
</button>
<div class="pp-absent"></div>

<style>
	.tile {
		/* Every one of these matches the `<button class="tile u">` above. */
		&:is(button) { color: red }
		&:where(button) { color: red }
		&:is(.u) { color: red }
		&:is(.tile) { color: red }
		&:is([data-k='v']) { color: red }
		&:is(*) { color: red }
		&.u:is(button) { color: red }
		&:not(div) { color: red }
		&:has(i) { color: red }
		&:is(button i) { color: red }

		/* The compound is reachable through `button`, so the report is the
		   unreachable BRANCH `a` rather than the whole compound. */
		&:is(a, button) { color: red }

		/* None of these do, and each must still be reported. */
		&:is(div) { color: red }
		&:is(.zz) { color: red }
		&:is(div, .zz) { color: red }
		.zz:is(button) { color: red }
	}

	button {
		&:is(.tile) { color: red }
	}

	/* The enclosing chain still constrains the compound the branch sits in. */
	.pp-missing {
		&:is(button) { color: red }
	}
</style>
