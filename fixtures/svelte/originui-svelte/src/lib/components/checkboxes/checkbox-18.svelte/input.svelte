<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';

	const items = [
		{ defaultChecked: true, id: 'checkbox-18-c1', label: 'Monday', value: 'c1' },
		{ defaultChecked: true, id: 'checkbox-18-c2', label: 'Tuesday', value: 'c2' },
		{ id: 'checkbox-18-c3', label: 'Wednesday', value: 'c3' },
		{ defaultChecked: true, id: 'checkbox-18-c4', label: 'Thursday', value: 'c4' },
		{ defaultChecked: true, id: 'checkbox-18-c5', label: 'Friday', value: 'c5' },
		{ id: 'checkbox-18-c6', label: 'Saturday', value: 'c6' },
		{ disabled: true, id: 'checkbox-18-c7', label: 'Sunday', value: 'c7' }
	];
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">Days of the week</legend>
	<div class="flex gap-1.5">
		{#each items as item (item.id)}
			<label
				class="border-input ring-offset-background has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"
				for={item.id}
			>
				<Checkbox
					id={item.id}
					value={item.value}
					class="sr-only after:absolute after:inset-0"
					checked={item.defaultChecked}
					disabled={item.disabled}
				/>
				<span aria-hidden="true" class="text-sm font-medium">
					{item.label[0]}
				</span>
				<span class="sr-only">{item.label}</span>
			</label>
		{/each}
	</div>
</fieldset>
