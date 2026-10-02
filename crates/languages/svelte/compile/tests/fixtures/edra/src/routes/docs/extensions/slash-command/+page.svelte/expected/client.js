import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to AI Assistant`, 1);
var root_1 = $.from_html(`Realtime Collaboration <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Slash Command</h1> <p class="lead">Trigger a contextual popup list of format utilities, components, and block-level insertions by
		typing <code>/</code>.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The slash command is registered as a custom TipTap extension mapping a suggestion plugin trigger
		(character: <code>/</code>) to a custom Svelte dropdown renderer:</p> <div class="my-4"><!></div> <h2>Included Commands</h2> <p>Typing <code>/</code> opens a floating popover positioned next to the cursor with two groups:</p> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Format:</strong> Heading 1-4 elements, Blockquotes, lists, and Code blocks.</li> <li><strong>Insert:</strong> Tables, inline/block LaTeX formulas, horizontal lines, image/video templates,
			and callout alerts.</li></ul> <h2>Customizing Commands List</h2> <p>The list of popup actions and groups is managed inside <code>src/lib/edra/tiptap/extensions/slash/index.ts</code>. You can configure group labels or add your own custom command items by editing the <code>GROUPS</code> array:</p> <div class="my-4"><!></div> <h2>Keyboard Navigation</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><code>ArrowUp / ArrowDown</code>: Scroll through the group commands list.</li> <li><code>Enter</code>: Select and run the active action.</li> <li><code>Escape</code>: Close the popup list.</li></ul> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
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

	var article = root_2();

	$.head('gqd5cv', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Slash Command | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: slashCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 12);
	var node_1 = $.child(div_1);

	Code(node_1, { code: customizeGroups, language: 'typescript' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/extensions/ai',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			ArrowLeft(node_3, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		href: '/docs/collaboration',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_5 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_5, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(article);
	$.append($$anchor, article);
}