<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import Brush from '@lucide/svelte/icons/brush';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Scissors from '@lucide/svelte/icons/scissors';
	import SwatchBook from '@lucide/svelte/icons/swatch-book';

	const items = [
		{ defaultChecked: true, Icon: SwatchBook, id: 'checkbox-16-c1', label: 'Palette', value: 'c1' },
		{ Icon: Brush, id: 'checkbox-16-c2', label: 'Brush', value: 'c2' },
		{ Icon: Eraser, id: 'checkbox-16-c3', label: 'Eraser', value: 'c3' },
		{ Icon: Scissors, id: 'checkbox-16-c4', label: 'Cut', value: 'c4' }
	];
</script>

<div class="grid grid-cols-2 gap-3">
	{#each items as item (item.id)}
		<label
			class="border-input has-data-[state=checked]:border-ring relative flex cursor-pointer flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"
			for={item.id}
		>
			<div class="flex justify-between gap-2">
				<Checkbox
					id={item.id}
					value={item.value}
					class="order-1 h-4 w-4 after:absolute after:inset-0"
					checked={item.defaultChecked}
				/>
				<item.Icon class="opacity-60" size={16} aria-hidden="true" />
			</div>
			<Label for={item.id}>{item.label}</Label>
		</label>
	{/each}
</div>
