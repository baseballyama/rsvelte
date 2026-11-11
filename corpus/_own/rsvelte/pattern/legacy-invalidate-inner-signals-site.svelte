<script>
	import Comp from './Comp.svelte';
	export let trails = [];
	let visits = [];
	let activityForm = { trail: '', tz: '' };

	function reset() {
		activityForm.tz = '';
		visits = [];
	}
</script>

<button onclick={reset}>reset</button>

{#each visits as visit (visit.id)}
	<Comp bind:tz={activityForm.tz} />
	<select bind:value={activityForm.trail}>
		{#each trails as trail (trail.id)}
			<option value={trail.id}>{visit.id}{trail.name}</option>
		{/each}
	</select>
{/each}
