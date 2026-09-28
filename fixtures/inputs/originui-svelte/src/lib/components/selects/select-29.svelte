<script lang="ts">
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

<div
	class="border-input bg-background focus-within:border-ring focus-within:ring-ring/20 relative rounded-lg border shadow-xs shadow-black/5 transition-shadow focus-within:ring-[3px] focus-within:outline-hidden has-disabled:cursor-not-allowed has-disabled:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none"
>
	<label for={uid} class="text-foreground block px-3 pt-2 text-xs font-medium">
		Select with inset label
	</label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class="border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0"
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
</div>
