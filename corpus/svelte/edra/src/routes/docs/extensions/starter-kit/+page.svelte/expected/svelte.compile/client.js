import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Usages`, 1);
var root_1 = $.from_html(`Tables Extension <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Starter Kit Extension</h1> <p class="lead">The core suite of editing tools providing headings, lists, links, and basic markdown commands.</p> <hr class="my-6"/> <h2>Configuration</h2> <p>Edra pre-configures <code>StarterKit</code> to ensure standard layouts align with the typography system.
		Bullet lists and ordered lists are decorated with standard classes automatically.</p> <div class="my-4"><!></div> <h2>Included Features</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Headings:</strong> Support for levels 1 to 4 with matching sizes.</li> <li><strong>Lists:</strong> Decoreated bullet lists (<code>list-disc</code>) and numbered lists (<code>list-decimal</code>).</li> <li><strong>Links:</strong> Automatically converts pasted URLs into links, opening in new tabs by default.</li> <li><strong>Basic Marks:</strong> Bold, Italic, Strike-through, and Code formatting.</li></ul> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const configCode = `import StarterKit from '@tiptap/starter-kit';

StarterKit.configure({
	orderedList: {
		HTMLAttributes: {
			class: 'list-decimal'
		}
	},
	bulletList: {
		HTMLAttributes: {
			class: 'list-disc'
		}
	},
	heading: {
		levels: [1, 2, 3, 4]
	},
	link: {
		openOnClick: false,
		autolink: true,
		linkOnPaste: true,
		HTMLAttributes: {
			target: '_blank',
			rel: 'noopener noreferrer nofollow'
		}
	},
	codeBlock: false
})`;

	var article = root_2();

	$.head('z3eqqs', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Starter Kit | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: configCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Button(node_1, {
		href: '/docs/usages',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			ArrowLeft(node_2, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		href: '/docs/extensions/tables',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_4 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_4, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(article);
	$.append($$anchor, article);
}