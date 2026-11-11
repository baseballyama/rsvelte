<div class="foo"><x></x></div>

<style>
	/* The control, and it has to come FIRST: this rule IS used, so its dead
	   branch is reported on the branch — and marking it is what leaves the
	   shared set non-empty for the rule below. */
	:global(.foo) :is(x, .early-unused) {
		color: blue;
	}

	/* The defect: every branch is unreachable, so the whole rule is unused and
	   the warning belongs on the whole selector, not on the `.unused` inside
	   the parens. Asked against the set the rule above filled, it was judged
	   used and the warning moved inside. */
	:global(.foo) :is(.unused) {
		color: red;
	}
</style>
