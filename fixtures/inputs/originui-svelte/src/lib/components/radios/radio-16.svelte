<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	const items = [
		{ icon: '😠', id: 'radio-16-r1', label: 'Angry', value: 'r1' },
		{ icon: '🙁', id: 'radio-16-r2', label: 'Sad', value: 'r2' },
		{ icon: '😐', id: 'radio-16-r3', label: 'Neutral', value: 'r3' },
		{ icon: '🙂', id: 'radio-16-r4', label: 'Happy', value: 'r4' },
		{ icon: '😀', id: 'radio-16-r5', label: 'Laughing', value: 'r5' }
	];

	let selectedValue = $state('r3');
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">How did it go?</legend>
	<RadioGroup class="flex gap-1.5" bind:value={selectedValue}>
		{#each items as item (item.id)}
			<label
				class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center rounded-full border text-center text-xl shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"
			>
				<RadioGroupItem
					id={item.id}
					value={item.value}
					class="sr-only after:absolute after:inset-0"
				/>
				{item.icon}
			</label>
		{/each}
	</RadioGroup>
</fieldset>
