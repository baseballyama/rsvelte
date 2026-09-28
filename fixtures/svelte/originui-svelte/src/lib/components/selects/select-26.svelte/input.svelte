<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const frontend = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Vue', value: 's2' },
		{ label: 'Angular', value: 's3' }
	] as const;

	const backend = [
		{ label: 'Node.js', value: 's4' },
		{ label: 'Python', value: 's5' },
		{ label: 'Java', value: 's6' }
	] as const;

	const items = [...frontend, ...backend];

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with separator</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger id={uid}>
			{selected?.label ?? 'Select a framework'}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.GroupHeading>Frontend</Select.GroupHeading>
				{#each frontend as item (item.value)}
					<Select.Item value={item.value}>
						{item.label}
					</Select.Item>
				{/each}
			</Select.Group>
			<Select.Separator />
			<Select.Group>
				<Select.GroupHeading>Backend</Select.GroupHeading>
				{#each backend as item (item.value)}
					<Select.Item value={item.value}>
						{item.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
