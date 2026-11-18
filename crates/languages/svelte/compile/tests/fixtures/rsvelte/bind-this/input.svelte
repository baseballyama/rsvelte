<script>
	import Foo from './Foo.svelte';
	let { p = $bindable(), C } = $props();
	let el;
	let a = $state();
	let refs = $state([]);
	let items = $state([{ el: null }]);
	const obj = { x: null };
</script>

<div bind:this={el}></div>
<span bind:this={a}></span>
<p bind:this={p}></p>
<b bind:this={obj.x}></b>
{#each items as item, i}
	<i bind:this={refs[i]}></i>
	<u bind:this={item.el}></u>
{/each}
<canvas bind:this={() => el, (v) => (el = v)}></canvas>
<Foo bind:this={a} x={1} />
<C bind:this={a} />
{#each [1, 2] as n, i (n)}
	<Foo bind:this={refs[i]} />
{/each}
