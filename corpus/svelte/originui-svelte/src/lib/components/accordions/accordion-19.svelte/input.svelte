<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';

	const items = [
		{
			collapsibles: [
				{
					content: 'We optimize every component for maximum performance and minimal bundle size.',
					title: 'What about performance?'
				},
				{
					content:
						'Our documentation is comprehensive and includes live examples for every component.',
					title: 'How is the documentation?'
				}
			],
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},
		{
			collapsibles: [
				{
					content:
						'Yes, our theming system is fully customizable and supports both light and dark modes.',
					title: 'Can I use custom themes?'
				},
				{
					content: 'We have first-class support for Tailwind CSS with custom utility classes.',
					title: 'What about Tailwind support?'
				}
			],
			id: '2',
			title: 'How can I customize the components?'
		},
		{
			collapsibles: [
				{
					content:
						'Our components are tree-shakeable and typically add minimal overhead to your bundle.',
					open: true,
					title: "What's the bundle size impact?"
				},
				{
					content: 'We support automatic code splitting for optimal loading performance.',
					title: 'How is code splitting handled?'
				}
			],
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},
		{
			collapsibles: [
				{
					content: 'We test with NVDA, VoiceOver, and JAWS to ensure broad compatibility.',
					title: 'Which screen readers are supported?'
				},
				{
					content:
						'Full keyboard navigation support is implemented following WAI-ARIA best practices.',
					title: 'What about keyboard navigation?'
				}
			],
			id: '4',
			title: 'How accessible are the components?'
		}
	];
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold">Table w/ left plus-minus</h2>
	<Accordion.Root type="single" class="w-full -space-y-px" value="3">
		{#each items as item (item.id)}
			<Accordion.Item
				value={item.id}
				class="bg-background overflow-hidden border first:rounded-t-lg last:rounded-b-lg"
			>
				<Accordion.Trigger class="px-4 py-3 text-[15px] leading-6 hover:no-underline">
					{item.title}
				</Accordion.Trigger>

				<Accordion.Content class="p-0">
					{#each item.collapsibles as collapsible (collapsible.title)}
						{@render CollapsibleDemo({
							content: collapsible.content,
							open: collapsible.open ?? false,
							title: collapsible.title
						})}
					{/each}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>

{#snippet CollapsibleDemo({
	content,
	open,
	title
}: {
	content: string;
	open: boolean;
	title: string;
})}
	<Collapsible class="border-border bg-accent space-y-1 border-t px-4 py-3" {open}>
		<CollapsibleTrigger
			class="flex gap-2 text-[15px] leading-6 font-semibold [&[data-state=open]>svg]:rotate-180"
		>
			<ChevronDown
				size={16}
				class="mt-1 shrink-0 opacity-60 transition-transform duration-200"
				aria-hidden="true"
			/>
			{title}
		</CollapsibleTrigger>
		<CollapsibleContent
			class="text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden ps-6 text-sm transition-all"
		>
			{content}
		</CollapsibleContent>
	</Collapsible>
{/snippet}
