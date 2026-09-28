<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	let checked = $state(false);

	function toggleSwitch() {
		checked = !checked;
	}

	const uid = $props.id();
</script>

<div>
	<Label for={uid} class="sr-only">Toggle switch</Label>
	<div class="group inline-flex items-center gap-2" data-state={checked ? 'checked' : 'unchecked'}>
		<button
			id="{uid}-off-label"
			class="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right text-sm font-medium"
			onclick={toggleSwitch}
		>
			Off
		</button>
		<Switch id={uid} bind:checked aria-labelledby="${uid}-off-label ${uid}-on-label" />
		<button
			id="{uid}-on-label"
			class="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left text-sm font-medium"
			onclick={toggleSwitch}
		>
			On
		</button>
	</div>
</div>
