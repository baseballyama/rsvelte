import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { createEditor, Edra } from '$lib/edra/headless/index.js';
import { ArrowLeft } from '@lucide/svelte';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Sample mock callAI for testing — streams a generic paragraph word-by-word */
		async function sampleCallAI(_prompt, onChunk, onError) {
			const paragraph = 'The quick brown fox jumps over the lazy dog. ' + 'This is a sample paragraph generated for testing purposes. ' + 'It demonstrates how the AI streaming interface works by delivering content word by word. ' + 'Each word arrives with a small delay to simulate real-time generation from an AI model.';
			const words = paragraph.split(' ');

			try {
				for (const word of words) {
					await new Promise((r) => setTimeout(r, 100));
					onChunk(word + ' ');
				}
			} catch(error) {
				onError(error instanceof Error ? error : new Error(String(error)));
			}
		}

		const onUpdate = () => {
			localStorage.setItem('edra-content', JSON.stringify(editor?.getJSON()));
		};

		const editor = createEditor({ onUpdate, callAI: sampleCallAI });

		onMount(() => {
			const content = JSON.parse(localStorage.getItem('edra-content') || '[]');

			editor?.commands.setContent(content, { contentType: 'json' });
		});

		$$renderer.push(`<header class="demo-header svelte-6s3ww">`);

		Button($$renderer, {
			variant: 'ghost',
			class: 'nodefault',
			href: resolve('/'),
			children: ($$renderer) => {
				ArrowLeft($$renderer, {});
				$$renderer.push(`<!----> Edra Headless`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		ToggleMode($$renderer, {});
		$$renderer.push(`<!----></header> <div class="demo-container svelte-6s3ww">`);

		Edra($$renderer, {
			editor,
			children: ($$renderer) => {
				if (Edra.UseAI) {
					$$renderer.push('<!--[-->');
					Edra.UseAI($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Edra.Toolbar) {
					$$renderer.push('<!--[-->');
					Edra.Toolbar($$renderer, { class: 'demo-toolbar' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Edra.BubbleMenu) {
					$$renderer.push('<!--[-->');
					Edra.BubbleMenu($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Edra.Content) {
					$$renderer.push('<!--[-->');
					Edra.Content($$renderer, { class: 'demo-content' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Edra.DragHandle) {
					$$renderer.push('<!--[-->');
					Edra.DragHandle($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}