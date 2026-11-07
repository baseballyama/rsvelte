<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	import IconMoon from '@lucide/svelte/icons/moon';
	import IconSun from '@lucide/svelte/icons/sun';

	let checked = $state(true);

	const uid = $props.id();
</script>

<div class="inline-flex items-center gap-2">
	<Switch id={uid} bind:checked aria-label="Toggle switch" />
	<Label for={uid}>
		<span class="sr-only">Toggle switch</span>
		{#if checked}
			<IconSun size={16} aria-hidden="true" />
		{:else}
			<IconMoon size={16} aria-hidden="true" />
		{/if}
	</Label>
</div>
