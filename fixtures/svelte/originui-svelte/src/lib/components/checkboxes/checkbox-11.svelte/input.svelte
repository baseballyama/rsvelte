<script lang="ts">
	import type { TransitionEventHandler } from 'svelte/elements';

	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';

	let checked = $state(false);
	let inputElement: HTMLInputElement | null = $state(null);

	const handleTransitionEnd: TransitionEventHandler<HTMLDivElement> = () => {
		if (checked && inputElement) {
			inputElement.focus();
		}
	};

	const uid = $props.id();
</script>

<div>
	<div class="flex items-start gap-2">
		<Checkbox id={uid} bind:checked aria-controls="{uid}-input" class="h-4 w-4" />
		<div class="grow">
			<div class="grid gap-2">
				<Label for={uid}>Checkbox with expansion</Label>
				<p id="{uid}-description" class="text-muted-foreground text-xs">
					You can use this checkbox with a label and a description.
				</p>
			</div>
			<!-- Expandable field -->
			<div
				role="region"
				id="{uid}-input"
				aria-labelledby={uid}
				class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"
				data-state={checked ? 'expanded' : 'collapsed'}
				ontransitionend={handleTransitionEnd}
			>
				<div class="-m-2 overflow-hidden p-2">
					<div class="mt-3">
						<Input
							bind:ref={inputElement}
							type="text"
							id="{uid}-additional-info"
							placeholder="Enter details"
							aria-label="Additional Information"
							disabled={!checked}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
