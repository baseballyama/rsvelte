import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import CliCode from '$lib/components/custom/docs/CliCode.svelte';
import { usageCode } from './code.ts';

export default function _page($$renderer) {
	$.head('t7c0hb', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Installation | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Installation</h1> <p class="lead">How to set up Edra in your Svelte 5 application.</p> <p>Edra is distributed as source code that you install directly into your project. This means you
		have full control over the code, styling, and dependencies. You can choose between two flavors: <strong>Shadcn UI</strong> and <strong>Headless UI</strong>.</p> <hr class="my-6"/> <h2>1. Shadcn UI Variant (Recommended)</h2> <p>This variant comes fully styled using Tailwind CSS and components from <code>shadcn-svelte</code>. It includes a beautiful toolbar, menus, dialogs, and a responsive layout.</p> <div class="callout my-6 rounded-md border-l-4 border-l-green-500 bg-green-500/10 p-4"><p class="m-0 font-medium text-green-700 dark:text-green-400">Registry Installation</p> <p class="m-0 mt-2 text-sm">Use the <code>shadcn-svelte</code> CLI to pull Edra directly from the remote registry. This is the
			cleanest way to install the editor and its dependencies.</p></div> <div class="my-4">`);

	CliCode($$renderer, { type: 'registry' });
	$$renderer.push(`<!----></div> <p>Alternatively, you can initialize the editor via the <strong>Edra CLI</strong>:</p> <div class="my-4">`);
	CliCode($$renderer, { type: 'shadcn' });

	$$renderer.push(`<!----></div> <div class="callout my-6 rounded-md border-l-4 border-l-yellow-500 bg-yellow-500/10 p-4"><p class="m-0 font-medium text-yellow-700 dark:text-yellow-400">Required shadcn-svelte Components</p> <p class="m-0 mt-2 text-sm">Edra depends on the following <code>shadcn-svelte</code> components. The registry install handles
			these automatically, but if you used the CLI or need to install them manually:</p> <div class="my-2">`);

	CliCode($$renderer, { type: 'shadcn-deps' });

	$$renderer.push(`<!----></div> <p class="m-0 mt-2 text-sm">Edra also requires <code>mode-watcher</code> and <code>svelte-sonner</code> for theme detection
			and toast notifications (AI features).</p></div> <hr class="my-6"/> <h2>2. Headless UI Variant</h2> <p>If you want to build your own custom UI and don't want to use Tailwind CSS or <code>shadcn-svelte</code>, use the Headless variant. It provides the logical core, extensions, and the raw TipTap
		wrapper without any opinionated UI components.</p> <div class="callout my-6 rounded-md border-l-4 border-l-purple-500 bg-purple-500/10 p-4"><p class="m-0 font-medium text-purple-700 dark:text-purple-400">Bring Your Own Styles</p> <p class="m-0 mt-2 text-sm">The Headless flavor utilizes custom CSS tokens (<code>--edra-*</code>) for basic structural
			styling. You will need to build your own toolbar and menus.</p></div> <div class="my-4">`);

	CliCode($$renderer, { type: 'headless' });

	$$renderer.push(`<!----></div> <hr class="my-6"/> <h2>Basic Setup</h2> <p>Once installed, you can import <code>createEditor</code> and the <code>Edra</code> component into
		your Svelte pages. The \`createEditor\` function takes care of assembling the extensions and binding
		event handlers.</p> <div class="my-4">`);

	Code($$renderer, { code: usageCode, language: 'svelte' });
	$$renderer.push(`<!----></div> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to Intro`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/configuration',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Configuration &amp; API `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}