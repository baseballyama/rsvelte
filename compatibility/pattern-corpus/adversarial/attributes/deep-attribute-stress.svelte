<script>
	let n = $state(0);
	const spread = { 'data-a': 1, 'data-b': 2 };
</script>

<div
	id="root"
	class="a b c"
	data-one={n}
	data-two="{n}-{n}"
	data-three={`${n}`}
	data-four={n > 0 ? 'y' : 'n'}
	data-five={[n, n].join('')}
	data-six={{ n }.n}
	data-seven={n ?? 0}
	data-eight={n || 0}
	data-nine={n && 1}
	data-ten={-n}
	aria-label="deep"
	role="group"
	tabindex="-1"
	{...spread}
	onclick={() => n++}
	onkeydown={(e) => e.key === 'Enter' && n++}
	style:--x={n}
	style:color="red"
	class:active={n > 0}
	use:noop
>
	<span>{n}</span>
</div>

<script module>
	export function noop() {}
</script>

<style>
	.active {
		font-weight: bold;
	}
</style>
