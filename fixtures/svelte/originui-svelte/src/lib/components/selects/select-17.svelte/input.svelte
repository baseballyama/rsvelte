<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	import Clock from '@lucide/svelte/icons/clock';

	const items = [
		{ label: '00:00 AM - 11:59 PM', value: 's1' },
		{ label: '01:00 AM - 12:59 PM', value: 's2' },
		{ label: '02:00 AM - 01:59 PM', value: 's3' },
		{ label: '03:00 AM - 02:59 PM', value: 's4' }
	];

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with icon</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger class="relative ps-9" id={uid}>
			<div
				class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"
			>
				<Clock size={16} aria-hidden="true" />
			</div>
			{selected?.label ?? 'Select a time'}
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
