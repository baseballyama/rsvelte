<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const items = [
		{ description: 'Ideal for individuals', label: 'Standard Plan', value: 's1' },
		{ description: 'For professional users', label: 'Pro Plan', value: 's2' },
		{ description: 'Built for large teams', label: 'Enterprise Plan', value: 's3' }
	] as const;

	let value = $state('s2');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with description and right indicator</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger id={uid}>
			{selected?.label ?? 'Select a plan'}
		</Select.Trigger>
		<Select.Content
			class="[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2"
		>
			{#each items as item (item.value)}
				<Select.Item value={item.value}>
					{item.label}
					<span class="text-muted-foreground mt-1 block text-xs">
						{item.description}
					</span>
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
