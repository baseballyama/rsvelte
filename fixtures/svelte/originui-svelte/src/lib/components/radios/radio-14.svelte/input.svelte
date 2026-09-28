<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	const items = [
		{ id: 'radio-14-r1', label: 'USA', value: 'r1' },
		{ id: 'radio-14-r2', label: 'UK', value: 'r2' },
		{ id: 'radio-14-r3', label: 'France', value: 'r3' }
	];
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">Server location</legend>
	<RadioGroup class="flex flex-wrap gap-2" value="r1">
		{#each items as item (item.id)}
			<div
				class="border-input has-data-[state=checked]:border-ring relative flex flex-col items-start gap-4 rounded-lg border p-3 shadow-xs shadow-black/[.04]"
			>
				<div class="flex items-center gap-2">
					<RadioGroupItem id={item.id} value={item.value} class="after:absolute after:inset-0" />
					<Label for={item.id}>{item.label}</Label>
				</div>
			</div>
		{/each}
	</RadioGroup>
</fieldset>
