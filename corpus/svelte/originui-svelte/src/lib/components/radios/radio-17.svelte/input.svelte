<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	let selectedValue = $state('');
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">
		How likely are you to recommend us?
	</legend>
	<RadioGroup
		class="flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/[.04]"
		bind:value={selectedValue}
	>
		{#each [0, 1, 2, 3, 4, 5] as number (number)}
			<label
				class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10"
			>
				<RadioGroupItem
					id="radio-17-r{number}"
					value={number.toString()}
					class="sr-only after:absolute after:inset-0"
				/>
				{number}
			</label>
		{/each}
	</RadioGroup>
</fieldset>
<div class="mt-1 flex justify-between text-xs font-medium">
	<p>
		<span class="text-base">😡</span> Not likely
	</p>
	<p>
		Very Likely <span class="text-base">😍</span>
	</p>
</div>
