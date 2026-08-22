<script>
	const plans = [
		{ id: 'free', price: 0 },
		{ id: 'pro', price: 10 },
	];
	let chosen = $state(plans[0]);
	let value = $state('shorthand');
</script>

{#each plans as plan (plan.id)}
	<label>
		<input type="radio" value={plan} bind:group={chosen} />
		{plan.id}
	</label>
{/each}

<input type="radio" name="s" {value} checked />
<p>{chosen.price}</p>
