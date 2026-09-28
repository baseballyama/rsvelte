<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import Blocks from '@lucide/svelte/icons/blocks';
	import Brain from '@lucide/svelte/icons/brain';
	import LineChart from '@lucide/svelte/icons/chart-line';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Database from '@lucide/svelte/icons/database';
	import Globe from '@lucide/svelte/icons/globe';
	import Layout from '@lucide/svelte/icons/layout-template';
	import Network from '@lucide/svelte/icons/network';
	import Search from '@lucide/svelte/icons/search';
	import Server from '@lucide/svelte/icons/server';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';

	let open = $state(false);
	let value = $state('');
	const items = [
		{
			icon: LineChart,
			label: 'Analytics Platform',
			number: 2451,
			value: 'analytics platform'
		},
		{
			icon: Brain,
			label: 'AI Services',
			number: 1832,
			value: 'ai services'
		},
		{
			icon: Database,
			label: 'Database Systems',
			number: 1654,
			value: 'database systems'
		},
		{
			icon: Cpu,
			label: 'Compute Resources',
			number: 943,
			value: 'compute resources'
		},
		{
			icon: Network,
			label: 'Network Services',
			number: 832,
			value: 'network services'
		},
		{
			icon: Globe,
			label: 'Web Services',
			number: 654,
			value: 'web services'
		},
		{
			icon: Search,
			label: 'Monitoring Tools',
			number: 432,
			value: 'monitoring tools'
		},
		{
			icon: Server,
			label: 'Server Management',
			number: 321,
			value: 'server management'
		},
		{
			icon: Blocks,
			label: 'Infrastructure',
			number: 234,
			value: 'infrastructure'
		},
		{
			icon: Layout,
			label: 'Frontend Services',
			number: 123,
			value: 'frontend services'
		}
	] as const;

	const selectedItem = $derived(items.find((item) => item.value === value));

	function handleSelect(currentValue: string) {
		value = currentValue;
		open = false;
	}
</script>

<div class="space-y-2">
	<Label>Options with icon and number</Label>
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
					{#if value && selectedItem}
						{@const IconComponent = selectedItem.icon}
						<span class="flex min-w-0 items-center gap-2">
							<IconComponent class="text-muted-foreground h-4 w-4" />
							<span class="truncate">{selectedItem.label}</span>
						</span>
					{:else}
						<span class="text-muted-foreground">Select service category</span>
					{/if}
					<ChevronDown size={16} class="text-muted-foreground/80 shrink-0" aria-hidden="true" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full min-w-(--bits-popover-anchor-width) p-0" align="start">
			<Command.Root>
				<Command.Input placeholder="Search services..." />
				<Command.List>
					<Command.Empty>No service found.</Command.Empty>
					<Command.Group>
						{#each items as item (item.value)}
							<Command.Item value={item.value} onSelect={() => handleSelect(item.value)}>
								<div class="flex items-center gap-2">
									<item.icon class="text-muted-foreground h-4 w-4" />
									{item.label}
								</div>
								<span class="text-muted-foreground text-xs">
									{item.number.toLocaleString()}
								</span>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
