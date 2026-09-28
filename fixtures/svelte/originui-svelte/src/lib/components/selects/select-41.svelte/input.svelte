<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';

	let open = $state(false);
	let value = $state('');

	const frameworks = [
		{ label: 'SvelteKit', value: 'sveltekit' },
		{ label: 'Svelte', value: 'svelte' },
		{ label: 'Nuxt.js', value: 'nuxt.js' },
		{ label: 'Remix', value: 'remix' },
		{ label: 'Astro', value: 'astro' },
		{ label: 'Angular', value: 'angular' },
		{ label: 'Vue.js', value: 'vue' },
		{ label: 'Ember.js', value: 'ember' },
		{ label: 'Gatsby', value: 'gatsby' },
		{ label: 'Eleventy', value: 'eleventy' },
		{ label: 'SolidJS', value: 'solid' },
		{ label: 'Preact', value: 'preact' },
		{ label: 'Qwik', value: 'qwik' },
		{ label: 'Next.js', value: 'next.js' },
		{ label: 'Alpine.js', value: 'alpine' },
		{ label: 'Lit', value: 'lit' }
	] as const;

	function handleSelect(currentValue: string) {
		value = currentValue === value ? '' : currentValue;
		open = false;
	}
</script>

<div class="space-y-2">
	<Label>Select with search</Label>
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
							{frameworks.find((framework) => framework.value === value)?.label}
						{:else}
							Select framework
						{/if}
					</span>
					<ChevronDown size={16} class="text-muted-foreground/80 shrink-0" aria-hidden="true" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full min-w-(--bits-popover-anchor-width) p-0" align="start">
			<Command.Root>
				<Command.Input placeholder="Search framework..." />
				<Command.List>
					<Command.Empty>No framework found.</Command.Empty>
					<Command.Group>
						{#each frameworks as framework (framework.value)}
							<Command.Item value={framework.value} onSelect={() => handleSelect(framework.value)}>
								{framework.label}
								<Check
									class={cn('ml-auto', value === framework.value ? 'opacity-100' : 'opacity-0')}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
