<script>
	let count = $state(0);
	let el;
	let value = $state('');
	let onlyRead = $state('r');
</script>
<button onclick={() => (count += 1)}>{count}</button>
<div bind:this={el}>bind this</div>
<input bind:value />
<p>{value}{onlyRead}</p>
