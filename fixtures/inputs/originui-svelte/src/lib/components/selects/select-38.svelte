<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';

	import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=40&h=40&enhanced';
	import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=40&h=40&enhanced';
	import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=40&h=40&enhanced';

	const items = [
		{ avatar: Avatar01, name: 'Jenny Hamilton', value: 's1' },
		{ avatar: Avatar02, name: 'Paul Smith', value: 's2' },
		{ avatar: Avatar03, name: 'Luna Wyen', value: 's3' }
	] as const;

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

{#snippet user(item: (typeof items)[number])}
	<enhanced:img class="size-5 rounded" src={item.avatar} alt={item.name} />
	<span class="truncate">{item.name}</span>
{/snippet}

<div class="space-y-2">
	<Label for={uid}>Options with avatar</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class={cn(
				'[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0',
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
			class="[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2"
		>
			<Select.Group>
				<Select.GroupHeading class="ps-2">Impersonate user</Select.GroupHeading>
				{#each items as item (item.value)}
					<Select.Item value={item.value}>
						{@render user(item)}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
