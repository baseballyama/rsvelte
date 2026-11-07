<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const items = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Next.js', value: 's2' },
		{ label: 'Astro', value: 's3' },
		{ label: 'Gatsby', value: 's4' }
	];

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="[&_svg]:text-destructive/80 space-y-2">
	<Label for={uid}>Select with error</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class="border-destructive/80 text-destructive focus:border-destructive/80 focus:ring-destructive/20"
		>
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
	<p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">
		Selected option is invalid
	</p>
</div>
