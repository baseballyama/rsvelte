import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import CliCode from '$lib/components/custom/docs/CliCode.svelte';
import { usageCode } from './code.ts';

var root = $.from_html(`<!> Back to Intro`, 1);
var root_1 = $.from_html(`Configuration & API <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Installation</h1> <p class="lead">How to set up Edra in your Svelte 5 application.</p> <p>Edra is distributed as source code that you install directly into your project. This means you
		have full control over the code, styling, and dependencies. You can choose between two flavors: <strong>Shadcn UI</strong> and <strong>Headless UI</strong>.</p> <hr class="my-6"/> <h2>1. Shadcn UI Variant (Recommended)</h2> <p>This variant comes fully styled using Tailwind CSS and components from <code>shadcn-svelte</code>. It includes a beautiful toolbar, menus, dialogs, and a responsive layout.</p> <div class="callout my-6 rounded-md border-l-4 border-l-green-500 bg-green-500/10 p-4"><p class="m-0 font-medium text-green-700 dark:text-green-400">Registry Installation</p> <p class="m-0 mt-2 text-sm">Use the <code>shadcn-svelte</code> CLI to pull Edra directly from the remote registry. This is the
			cleanest way to install the editor and its dependencies.</p></div> <div class="my-4"><!></div> <p>Alternatively, you can initialize the editor via the <strong>Edra CLI</strong>:</p> <div class="my-4"><!></div> <div class="callout my-6 rounded-md border-l-4 border-l-yellow-500 bg-yellow-500/10 p-4"><p class="m-0 font-medium text-yellow-700 dark:text-yellow-400">Required shadcn-svelte Components</p> <p class="m-0 mt-2 text-sm">Edra depends on the following <code>shadcn-svelte</code> components. The registry install handles
			these automatically, but if you used the CLI or need to install them manually:</p> <div class="my-2"><!></div> <p class="m-0 mt-2 text-sm">Edra also requires <code>mode-watcher</code> and <code>svelte-sonner</code> for theme detection
			and toast notifications (AI features).</p></div> <hr class="my-6"/> <h2>2. Headless UI Variant</h2> <p>If you want to build your own custom UI and don't want to use Tailwind CSS or <code>shadcn-svelte</code>, use the Headless variant. It provides the logical core, extensions, and the raw TipTap
		wrapper without any opinionated UI components.</p> <div class="callout my-6 rounded-md border-l-4 border-l-purple-500 bg-purple-500/10 p-4"><p class="m-0 font-medium text-purple-700 dark:text-purple-400">Bring Your Own Styles</p> <p class="m-0 mt-2 text-sm">The Headless flavor utilizes custom CSS tokens (<code>--edra-*</code>) for basic structural
			styling. You will need to build your own toolbar and menus.</p></div> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Basic Setup</h2> <p>Once installed, you can import <code>createEditor</code> and the <code>Edra</code> component into
		your Svelte pages. The \`createEditor\` function takes care of assembling the extensions and binding
		event handlers.</p> <div class="my-4"><!></div> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	var article = root_2();

	$.head('t7c0hb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Installation | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 14);
	var node = $.child(div);

	CliCode(node, { type: 'registry' });
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_1 = $.child(div_1);

	CliCode(node_1, { type: 'shadcn' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 4);
	var node_2 = $.child(div_3);

	CliCode(node_2, { type: 'shadcn-deps' });
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 10);
	var node_3 = $.child(div_4);

	CliCode(node_3, { type: 'headless' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 8);
	var node_4 = $.child(div_5);

	Code(node_4, {
		get code() {
			return usageCode;
		},
		language: 'svelte'
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.child(div_6);

	Button(node_5, {
		href: '/docs',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_6 = $.first_child(fragment);

			ArrowLeft(node_6, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 2);

	Button(node_7, {
		href: '/docs/configuration',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_8 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_8, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(article);
	$.append($$anchor, article);
}