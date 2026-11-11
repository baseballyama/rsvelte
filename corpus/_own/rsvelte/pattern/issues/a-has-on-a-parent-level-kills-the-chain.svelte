<div id="root" class="sw">
	<div class="bar">
		<span class="trigger"></span>
	</div>
</div>

<style>
	/* The parent's only reason to be unused is its `:has()`, and the compound
	   scan the chain check runs reads a pseudo-class as constraining nothing —
	   so the parent was reported and everything nested in it survived. */
	.sw:has(button:focus) {
		.trigger { color: red }
	}
	#root:has(.absent) .bar {
		.trigger { color: red }
	}
	.sw:has(button) {
		.bar {
			.trigger { color: red }
		}
	}

	/* Controls: a `:has()` the component does satisfy keeps the whole chain,
	   and a dead child under a live `:has()` parent is still reported on its
	   own. */
	.sw:has(span:focus) {
		.trigger { color: red }
	}
	.sw:has(.trigger) {
		.bar { color: red }
	}
	.sw:has(.trigger) {
		.absent-child { color: red }
	}
</style>
