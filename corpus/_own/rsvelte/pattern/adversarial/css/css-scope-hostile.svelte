<script>
	let active = $state(true);
</script>

<div class="root" class:active>
	<p class="a b">text</p>
	<span data-x="1">span</span>
	<ul><li class="item">i</li></ul>
</div>

<style>
	.root :global(.injected) { color: red; }
	.root > :global(.child .grand) { color: blue; }
	:global(.outer) .root { color: green; }
	.a.b { font-weight: bold; }
	.root:has(> .a) { outline: 1px solid; }
	.root :is(p, span):not(.a) { opacity: 0.5; }
	li:nth-child(2n of .item) { color: teal; }
	@media (min-width: 10px) and (max-width: 1000px) {
		.root { padding: 0; }
		@supports (display: grid) {
			.root { display: grid; }
		}
	}
	@keyframes -global-spin { from { rotate: 0deg; } to { rotate: 360deg; } }
	@keyframes local-spin { from { rotate: 0deg; } to { rotate: 90deg; } }
	.active { animation: local-spin 1s linear infinite, -global-spin 2s; }
	.root::before { content: "}{ \" '"; }
	.root { background: url("a}b.png"); }
</style>
