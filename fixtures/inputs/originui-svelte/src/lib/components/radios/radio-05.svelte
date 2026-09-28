<script lang="ts">
	import type { TransitionEventHandler } from 'svelte/elements';

	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	let selectedValue = $state('without-expansion');
	let inputElement = $state<HTMLInputElement | null>(null);

	const handleTransitionEnd: TransitionEventHandler<HTMLDivElement> = () => {
		if (selectedValue === 'with-expansion' && inputElement) {
			inputElement.focus();
		}
	};
</script>

<RadioGroup class="gap-6" bind:value={selectedValue}>
	<div>
		<div class="flex items-start gap-2">
			<RadioGroupItem
				value="with-expansion"
				id="radio-05-with-expansion"
				aria-describedby="radio-05-with-expansion-description"
				aria-controls="radio-input-05"
			/>
			<div class="grow">
				<div class="grid grow gap-2">
					<Label for="radio-05-with-expansion">Radio with expansion</Label>
					<p id="radio-05-with-expansion-description" class="text-muted-foreground text-xs">
						You can use this radio with a label and a description.
					</p>
				</div>
				<!-- Expandable field -->
				<div
					ontransitionend={handleTransitionEnd}
					role="region"
					id="radio-input-05"
					aria-labelledby="radio-05-with-expansion"
					class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"
					data-state={selectedValue === 'with-expansion' ? 'expanded' : 'collapsed'}
				>
					<div class="-m-2 overflow-hidden p-2">
						<div class="mt-3">
							<Input
								bind:ref={inputElement}
								type="text"
								id="radio-05-additional-info"
								placeholder="Enter details"
								aria-label="Additional Information"
								disabled={selectedValue !== 'with-expansion'}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<RadioGroupItem
			value="without-expansion"
			id="radio-05-without-expansion"
			aria-describedby="radio-05-without-expansion-description"
		/>
		<div class="grid grow gap-2">
			<Label for="radio-05-without-expansion">Radio without expansion</Label>
			<p id="radio-05-without-expansion-description" class="text-muted-foreground text-xs">
				You can use this checkbox with a label and a description.
			</p>
		</div>
	</div>
</RadioGroup>
