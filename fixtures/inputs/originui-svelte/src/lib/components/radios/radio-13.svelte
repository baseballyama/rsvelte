<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	const items = [
		{ id: 'radio-13-r1', label: '2 CPU', value: 'r1' },
		{ id: 'radio-13-r2', label: '4 CPU', value: 'r2' },
		{ id: 'radio-13-r3', label: '6 CPU', value: 'r3' },
		{ id: 'radio-13-r4', label: '8 CPU', value: 'r4' },
		{ id: 'radio-13-r5', label: '12 CPU', value: 'r5' },
		{ disabled: true, id: 'radio-13-r6', label: '16 CPU', value: 'r6' }
	];
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">CPU Cores</legend>
	<RadioGroup class="grid grid-cols-3 gap-2" value="r1">
		{#each items as item (item.id)}
			<label
				class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"
			>
				<RadioGroupItem
					id={item.id}
					value={item.value}
					class="sr-only after:absolute after:inset-0"
					disabled={item.disabled}
				/>
				<p class="text-foreground text-sm leading-none font-medium">{item.label}</p>
			</label>
		{/each}
	</RadioGroup>
</fieldset>
