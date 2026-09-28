<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const items = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Next.js', value: 's2' },
		{ label: 'Astro', value: 's3' },
		{ label: 'Gatsby', value: 's4' }
	] as const;

	let value = $state('');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="group relative">
	<Label
		for={uid}
		class="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50"
		>Select with overlapping label</Label
	>
	<Select.Root type="single" bind:value>
		<Select.Trigger id={uid}>
			{selected?.label ?? 'Select a framework'}
		</Select.Trigger>
		<Select.Content>
			{#each items as item (item.value)}
				<Select.Item value={item.value}>
					{item.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
