import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

export default function _page($$renderer) {
	const slashCode = `import SlashCommand from '$lib/edra/tiptap/extensions/slash/index.js';
import SlashCommandComp from './components/SlashCommand.svelte';

// Integrated inside createEditor in editor.ts:
SlashCommand(SlashCommandComp)`;

	const customizeGroups = `// In src/lib/edra/tiptap/extensions/slash/index.ts
const GROUPS = [
	{
		name: 'format',
		title: 'Format',
		actions: [
			...commands.headings,
			{
				icon: Quote,
				name: 'blockquote',
				tooltip: 'Blockquote',
				onClick: (editor) => editor.chain().focus().setBlockquote().run()
			}
		]
	}
];`;

	$.head('gqd5cv', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Slash Command | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Slash Command</h1> <p class="lead">Trigger a contextual popup list of format utilities, components, and block-level insertions by
		typing <code>/</code>.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The slash command is registered as a custom TipTap extension mapping a suggestion plugin trigger
		(character: <code>/</code>) to a custom Svelte dropdown renderer:</p> <div class="my-4">`);

	Code($$renderer, { code: slashCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <h2>Included Commands</h2> <p>Typing <code>/</code> opens a floating popover positioned next to the cursor with two groups:</p> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Format:</strong> Heading 1-4 elements, Blockquotes, lists, and Code blocks.</li> <li><strong>Insert:</strong> Tables, inline/block LaTeX formulas, horizontal lines, image/video templates,
			and callout alerts.</li></ul> <h2>Customizing Commands List</h2> <p>The list of popup actions and groups is managed inside <code>src/lib/edra/tiptap/extensions/slash/index.ts</code>. You can configure group labels or add your own custom command items by editing the <code>GROUPS</code> array:</p> <div class="my-4">`);

	Code($$renderer, { code: customizeGroups, language: 'typescript' });
	$$renderer.push(`<!----></div> <h2>Keyboard Navigation</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><code>ArrowUp / ArrowDown</code>: Scroll through the group commands list.</li> <li><code>Enter</code>: Select and run the active action.</li> <li><code>Escape</code>: Close the popup list.</li></ul> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/extensions/ai',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to AI Assistant`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/collaboration',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Realtime Collaboration `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}