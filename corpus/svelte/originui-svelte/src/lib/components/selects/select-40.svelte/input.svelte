<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';

	import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=80&h=80&enhanced';
	import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=80&h=80&enhanced';
	import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=80&h=80&enhanced';

	const items = [
		{ avatar: Avatar01, name: 'Jenny Hamilton', username: '@jennycodes', value: 's1' },
		{ avatar: Avatar02, name: 'Paul Smith', username: '@paulsmith', value: 's2' },
		{ avatar: Avatar03, name: 'Luna Wyen', username: '@wyen.luna', value: 's3' }
	] as const;

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

{#snippet user(item: (typeof items)[number])}
	<span class="flex items-center gap-2">
		<enhanced:img class=" size-10 rounded-full" src={item.avatar} alt={item.name} />
		<span>
			<span class="block font-medium">{item.name}</span>
			<span class="text-muted-foreground mt-0.5 block text-xs">{item.username}</span>
		</span>
	</span>
{/snippet}

<div class="space-y-2">
	<Label for={uid}>Options with portrait</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class={cn(
				'h-auto [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0',
				selected && 'ps-2'
			)}
		>
			{#if selected}
				{@render user(selected)}
			{:else}
				Select a user
			{/if}
		</Select.Trigger>
		<Select.Content
			class="[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2"
		>
			{#each items as item (item.value)}
				<Select.Item value={item.value}>
					{@render user(item)}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
