import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { initCode, providerCode } from './code.ts';

export default function _page($$renderer) {
	$.head('w4l36a', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>AI Assistant | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>AI Assistant Extension</h1> <p class="lead">Integrate custom AI generation models to support inline autocompletions, content rewriting, and
		streaming text chunks directly in your editor views.</p> <hr class="my-6"/> <h2>Overview</h2> <p>The AI Assistant is powered by the custom <code>AIHighlight</code> TipTap Mark. It highlights text
		blocks that are undergoing AI processing/generation, and features a clean callback structure to connect
		any backend AI provider (like Google Gemini, OpenAI, or Anthropic).</p> <h2>Connecting your AI Provider</h2> <p>To initialize the AI helper, define a <code>callAI</code> streaming handler and pass it to the <code>createEditor</code> initializer:</p> <div class="my-4">`);

	Code($$renderer, { code: providerCode, language: 'typescript' });
	$$renderer.push(`<!----></div> <p>Pass the handler inside your editor props configuration:</p> <div class="my-4">`);
	Code($$renderer, { code: initCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <h2>Autocompletion Triggers</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Space Activation:</strong> Pressing the <code>Space</code> bar on any empty line inserts
			a placeholder and triggers the AI generator immediately.</li> <li><strong>Keyboard Shortcut:</strong> Highlight any block of text and press <code>Mod + Shift + AI</code> (Cmd/Ctrl + Shift + Y depending on config) to apply the AI highlight
			command.</li> <li><strong>Selection Actions:</strong> Select any block and use the drag handle menu to transform,
			shorten, or explain text using the AI agent.</li></ul> <div class="mt-12 flex">`);

	Button($$renderer, {
		href: '/docs/extensions/code-block',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to Codeblock`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}