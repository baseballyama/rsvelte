<div class="v">vars</div>

<style>
	.v {
		--empty: ;
		--json: '{ "k": 1 }';
		--arr: [1, 2];
		--sel: a > b ~ c;
		--parens: calc((1px + 2px) * 3);
		--semi-free: 1px 2px, 3px 4px;
		--url: url('/x.png');
		padding: var(--parens, var(--semi-free, 0));
	}
</style>
