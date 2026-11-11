<script>
	import C from './C.svelte';
	let k = $state(1);
</script>
<C let:item let:index={i} let:pair={{ a, b: [c], ...rest }}>
	{#each item as x}<p onclick={() => k++}>{x} {i} {a} {c} {rest.d} {k}</p>{/each}
	<div slot="named" let:x>{x}</div>
	<svelte:fragment slot="f" let:y={{ z }}>{z}</svelte:fragment>
	<C slot="comp" let:w foo={w}>{w}</C>
	<p slot="consts" let:v>
		{@const twice = v * 2}
		{twice}
	</p>
</C>
<C><svelte:fragment let:v>{v}</svelte:fragment></C>
<C><svelte:fragment slot="default" let:u>{u}</svelte:fragment></C>
