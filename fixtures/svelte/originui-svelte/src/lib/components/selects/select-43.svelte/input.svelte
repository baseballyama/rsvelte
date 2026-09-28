<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';

	let open = $state(false);
	let value = $state('Europe/Berlin');

	const timezones = Intl.supportedValuesOf('timeZone');

	const formattedTimezones = timezones
		.map((timezone) => {
			const formatter = new Intl.DateTimeFormat('en', {
				timeZone: timezone,
				timeZoneName: 'shortOffset'
			});
			const parts = formatter.formatToParts(new Date());
			const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
			const modifiedOffset = offset === 'GMT' ? 'GMT+0' : offset;

			return {
				label: `(${modifiedOffset}) ${timezone.replace(/_/g, ' ')}`,
				numericOffset: parseInt(offset.replace('GMT', '').replace('+', '') || '0'),
				value: timezone
			};
		})
		.sort((a, b) => a.numericOffset - b.numericOffset);

	function handleSelect(currentValue: string) {
		value = currentValue === value ? '' : currentValue;
		open = false;
	}

	function filterFn(value: string, search: string) {
		const normalizedValue = value.toLowerCase();
		const normalizedSearch = search.toLowerCase().replace(/\s+/g, '');
		return normalizedValue.includes(normalizedSearch) ? 1 : 0;
	}
</script>

<div class="space-y-2">
	<Label>Timezone select with search</Label>
	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					class="bg-background hover:bg-background focus-visible:border-ring focus-visible:outline-ring/20 w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]"
					{...props}
				>
					<span class={cn('truncate', !value && 'text-muted-foreground')}>
						{#if value}
							{formattedTimezones.find((timezone) => timezone.value === value)?.label}
						{:else}
							Select timezone
						{/if}
					</span>
					<ChevronDown size={16} class="text-muted-foreground/80 shrink-0" aria-hidden="true" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full min-w-(--bits-popover-anchor-width) p-0" align="start">
			<Command.Root filter={filterFn}>
				<Command.Input placeholder="Search timezone..." />
				<Command.List>
					<Command.Empty>No timezone found.</Command.Empty>
					<Command.Group>
						{#each formattedTimezones as { label, value: itemValue } (itemValue)}
							<Command.Item value={itemValue} onSelect={() => handleSelect(itemValue)}>
								{label}
								<Check class={cn('ml-auto', value === itemValue ? 'opacity-100' : 'opacity-0')} />
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
