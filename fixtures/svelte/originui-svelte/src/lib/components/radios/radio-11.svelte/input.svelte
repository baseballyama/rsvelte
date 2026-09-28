<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	import IconBrush from '@lucide/svelte/icons/brush';
	import IconEraser from '@lucide/svelte/icons/eraser';
	import IconScissors from '@lucide/svelte/icons/scissors';
	import IconSwatchBook from '@lucide/svelte/icons/swatch-book';

	const items = [
		{ Icon: IconSwatchBook, id: 'radio-11-r1', label: 'Palette', value: 'r1' },
		{ Icon: IconBrush, id: 'radio-11-r2', label: 'Brush', value: 'r2' },
		{ Icon: IconEraser, id: 'radio-11-r3', label: 'Eraser', value: 'r3' },
		{ Icon: IconScissors, id: 'radio-11-r4', label: 'Cut', value: 'r4' }
	];

	let selectedValue = $state('r1');
</script>

<RadioGroup class="grid grid-cols-2 gap-2" bind:value={selectedValue}>
	{#each items as item (item.id)}
		<div
			class="border-input has-data-[state=checked]:border-ring relative flex flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"
		>
			<div class="flex justify-between gap-2">
				<RadioGroupItem
					id={item.id}
					value={item.value}
					class="order-1 after:absolute after:inset-0"
				/>

				<item.Icon class="opacity-60" size={16} aria-hidden="true" />
			</div>
			<Label for={item.id}>{item.label}</Label>
		</div>
	{/each}
</RadioGroup>
