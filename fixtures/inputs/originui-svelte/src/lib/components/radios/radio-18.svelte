<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	import IconCheck from '@lucide/svelte/icons/check';
	import IconMinus from '@lucide/svelte/icons/minus';
	import UiDark from '$assets/ui-dark.png?enhanced';
	import UiLight from '$assets/ui-light.png?enhanced';
	import UiSystem from '$assets/ui-system.png?enhanced';

	const items = [
		{ id: 'radio-18-r1', image: UiLight, label: 'Light', value: 'r1' },
		{ id: 'radio-18-r2', image: UiDark, label: 'Dark', value: 'r2' },
		{ id: 'radio-18-r3', image: UiSystem, label: 'System', value: 'r3' }
	] as const;
</script>

<fieldset class="space-y-4">
	<legend class="text-foreground text-sm leading-none font-medium">Choose a theme</legend>
	<RadioGroup class="flex gap-3" value="r1">
		{#each items as item (item.id)}
			<label>
				<RadioGroupItem
					id={item.id}
					value={item.value}
					class="peer sr-only after:absolute after:inset-0"
				/>
				<enhanced:img
					src={item.image}
					alt={item.label}
					class="border-input ring-offset-background peer-focus-visible:ring-ring/70 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative h-[70px] w-[88px] cursor-pointer overflow-hidden rounded-lg border shadow-xs shadow-black/[.04] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
				/>
				<span
					class="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1"
				>
					<IconCheck
						size={16}
						stroke-width="2"
						class="in-[.group]:peer-data-[state=unchecked]:hidden"
						aria-hidden="true"
					/>
					<IconMinus
						size={16}
						stroke-width="2"
						class="in-[.group]:peer-data-[state=checked]:hidden"
						aria-hidden="true"
					/>
					<span class="text-xs font-medium">{item.label}</span>
				</span>
			</label>
		{/each}
	</RadioGroup>
</fieldset>
