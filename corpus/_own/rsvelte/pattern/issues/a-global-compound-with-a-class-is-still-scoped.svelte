<div class="here"><span class="in k"></span></div>
<img class="k" alt="" />

<style>
	/* Only a pseudo-class or pseudo-element keeps `:global(...)` global: the
	   class in each compound is scoped, and the specificity bump moves on. */
	:global(img).k { color: red }
	div :global(img).k { color: blue }
	.here :global(span).k { color: green }
	.absent { :global(img).k { color: red } }
	.here { :global(span).k { color: red } }
	:global(img):hover { color: red }
	:root:has(.in) .k { color: red }
	:host.k { color: red }
</style>
