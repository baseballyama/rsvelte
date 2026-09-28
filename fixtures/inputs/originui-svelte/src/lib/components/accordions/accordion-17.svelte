<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	const items = [
		{
			content:
				'Origin UI focuses on developer experience and performance. Built with TypeScript, it offers excellent type safety, follows accessibility standards, and provides comprehensive documentation with regular updates.',
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},
		{
			content:
				'Use our CSS variables for global styling, or class and style props for component-specific changes. We support CSS modules, Tailwind, and dark mode out of the box.',
			id: '2',
			title: 'How can I customize the components?'
		},
		{
			content:
				'Yes, with tree-shaking, code splitting, and minimal runtime overhead. Most components are under 5KB gzipped.',
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},
		{
			content:
				'All components follow WAI-ARIA standards, featuring proper ARIA attributes, keyboard navigation, and screen reader support. Regular testing ensures compatibility with NVDA, VoiceOver, and JAWS.',
			id: '4',
			title: 'How accessible are the components?'
		}
	];
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold">Table w/ left chevron</h2>
	<Accordion.Root type="single" class="w-full -space-y-px" value="3">
		{#each items as item (item.id)}
			<Accordion.Item
				value={item.id}
				class="bg-background border px-4 py-1 first:rounded-t-lg last:rounded-b-lg"
			>
				<Accordion.Trigger
					class="justify-start gap-3 py-2 text-[15px] leading-6 hover:no-underline [&>svg]:-order-1"
				>
					{item.title}
				</Accordion.Trigger>
				<Accordion.Content class="text-muted-foreground ps-7 pb-2">
					{item.content}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
