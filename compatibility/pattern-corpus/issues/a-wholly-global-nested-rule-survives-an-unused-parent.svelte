<div class="here"><span class="in"></span></div>

<style>
	/* The rule's whole selector is `:global(...)`, so an unused ancestor cannot
	   make it unused: only the ancestor is reported, and the printed comment is
	   `(unused)` rather than `(empty)`. */
	.absent { :global(img) { color: red } }
	.absent { .deeper { :global(img) { color: red } } }
	.absent { :global { img { color: red } } }
	@media (min-width: 1px) {
		.absent { :global(img) { color: red } }
	}
	.absent {
		:global(img) { color: red }
		.in { color: red }
	}

	/* A `:global` that shares its compound or its chain with a local part is
	   still reported, which is what separates this from "never report a
	   selector that mentions :global". */
	.absent { & :global(img) { color: red } }
	.absent { :global(img).k { color: red } }
	.absent :global(img) { color: red }

	/* Controls: a used parent reports nothing, a local child under an unused
	   parent is still reported, and a top-level `:global` is never reported. */
	.here { :global(img) { color: red } }
	.absent { .in { color: red } }
	:global(img) { color: red }
</style>
