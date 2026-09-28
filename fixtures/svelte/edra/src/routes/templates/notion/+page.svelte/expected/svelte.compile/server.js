import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { createEditor, Edra } from '$lib/edra/shadcn/index.js';
import { onMount } from 'svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft, Columns2 } from '@lucide/svelte';
import { cn } from '$lib/utils.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pageTitle = 'Notion-Like Workspace';
		let fullWidth = false;

		// Mock covers list
		const covers = [
			'from-pink-500 via-red-500 to-yellow-500',
			'from-green-400 to-blue-600',
			'from-purple-600 to-indigo-600',
			'from-indigo-400 via-purple-400 to-pink-400'
		];

		let activeCoverIndex = 0;

		function changeCover() {
			activeCoverIndex = (activeCoverIndex + 1) % covers.length;
		}

		const onUpdate = () => {
			localStorage.setItem('edra-content', JSON.stringify(editor?.getJSON()));
		};

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

		const editor = createEditor({ onUpdate, callAI: sampleCallAI });

		onMount(() => {
			const content = JSON.parse(localStorage.getItem('edra-content') || '[]');

			editor?.commands.setContent(content, { contentType: 'json' });
		});

		$.head('1ot1wcu', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(pageTitle || 'Untitled')} | Edra Workspace</title>`);
			});
		});

		$$renderer.push(`<div class="flex min-h-screen flex-col bg-background text-foreground"><header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur"><div class="flex items-center gap-3">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'icon',
			href: resolve('/'),
			class: 'nodefault',
			children: ($$renderer) => {
				ArrowLeft($$renderer, { class: 'size-4' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <span class="max-w-40 truncate text-sm font-semibold md:max-w-64">${$.escape(pageTitle || 'Untitled')}</span></div> <div class="flex items-center gap-2">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'sm',
			onclick: () => fullWidth = !fullWidth,
			class: 'h-8 gap-1.5 text-xs',
			children: ($$renderer) => {
				Columns2($$renderer, { class: 'size-3.5' });
				$$renderer.push(`<!----> <span>${$.escape(fullWidth ? 'Standard Width' : 'Full Width')}</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		ToggleMode($$renderer, {});
		$$renderer.push(`<!----></div></header> <div${$.attr_class($.clsx(cn('group relative h-48 w-full bg-linear-to-r transition-all! duration-500!', covers[activeCoverIndex])))}>`);

		Button($$renderer, {
			variant: 'outline',
			size: 'sm',
			onclick: changeCover,
			class: 'absolute right-6 bottom-4 h-8 border bg-background/90 text-xs opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:bg-background',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Change cover`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <main class="flex-1 grow overflow-y-auto pb-32"><div${$.attr_class($.clsx(cn('mx-auto mb-6 border-b border-border/40 px-8 pt-10 pb-4 transition-all duration-300 md:px-16', fullWidth ? 'max-w-full' : 'max-w-3xl')))}><input type="text"${$.attr('value', pageTitle)} class="w-full border-hidden bg-transparent text-4xl font-bold tracking-tight outline-hidden placeholder:opacity-20 focus:ring-0" placeholder="Untitled Workspace"/></div> `);

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

				if (Edra.ToC) {
					$$renderer.push('<!--[-->');
					Edra.ToC($$renderer, {});
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

					Edra.Content($$renderer, {
						class: cn('mx-auto w-full cursor-auto px-8 py-4 text-base transition-all duration-300 *:outline-none', fullWidth ? 'max-w-full' : 'max-w-3xl')
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Edra.DragHandle) {
					$$renderer.push('<!--[-->');
					Edra.DragHandle($$renderer, { type: 'extended', class: 'transition-all! duration-300!' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></main></div>`);
	});
}