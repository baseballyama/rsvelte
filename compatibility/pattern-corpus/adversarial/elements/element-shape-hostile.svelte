<script>
	let tag = $state('div');
	let n = $state(0);
</script>

<br />
<hr>
<img src="a.png" alt="" />
<input />
<custom-element data-x={n}><span>slotted</span></custom-element>
<svelte:element this={tag} data-n={n}>dyn</svelte:element>
<svelte:element this={n > 0 ? 'p' : 'span'}>{n}</svelte:element>
<div><p>implicit</p><p>close</p></div>
<ul><li>a</li><li>b</li></ul>
<table><tbody><tr><td>{n}</td></tr></tbody></table>
<button onclick={() => n++}>+</button>
