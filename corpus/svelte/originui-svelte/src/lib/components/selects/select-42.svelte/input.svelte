<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';

	let open = $state(false);
	let value = $state('originui');

	const organizations = [
		{
			label: 'Origin UI - Svelte',
			value: 'originui'
		},
		{
			label: 'Bits UI',
			value: 'bitsui'
		}
	] as const;

	function handleSelect(currentValue: string) {
		value = currentValue === value ? '' : currentValue;
		open = false;
	}
</script>

<div class="space-y-2">
	<Label>Select with search and button</Label>
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
							{organizations.find((organization) => organization.value === value)?.label}
						{:else}
							Select organization
						{/if}
					</span>
					<ChevronDown size={16} class="text-muted-foreground/80 shrink-0" aria-hidden="true" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full min-w-(--bits-popover-anchor-width) p-0" align="start">
			<Command.Root>
				<Command.Input placeholder="Find organization" />
				<Command.List>
					<Command.Empty>No organization found.</Command.Empty>
					<Command.Group>
						{#each organizations as organization (organization.value)}
							<Command.Item
								value={organization.value}
								onSelect={() => handleSelect(organization.value)}
							>
								{organization.label}
								<Check
									class={cn('ml-auto', value === organization.value ? 'opacity-100' : 'opacity-0')}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
					<Command.Separator />
					<Command.Group>
						<Button variant="ghost" class="w-full justify-start font-normal">
							<Plus size={16} class="-ms-2 me-2 opacity-60" aria-hidden="true" />
							New organization
						</Button>
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
