import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { createEditor, Edra } from '$lib/edra/shadcn/index.js';
import { onMount } from 'svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft } from '@lucide/svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex min-h-screen flex-col bg-background text-foreground"><header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur"><div class="flex items-center gap-3"><!> <span class="text-sm font-semibold">AI Editor</span></div> <!></header> <main class="flex flex-1 justify-center px-6 py-16"><div class="w-full max-w-5xl rounded-lg border transition-all duration-500"><!></div></main> <footer class="sticky bottom-0 flex items-center justify-between border-t bg-muted/40 px-6 py-3 text-xs text-muted-foreground select-none"><span class="flex items-center gap-1.5"><span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span> Clean writing environment</span> <span> </span></footer></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let words = $.state(0);

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

	editor?.on('transaction', () => {
		$.set(words, editor.storage.characterCount.words(), true);
	});

	onMount(() => {
		const content = JSON.parse(localStorage.getItem('edra-content') || '[]');

		editor?.commands.setContent(content, { contentType: 'json' });
	});

	var div = root_1();

	$.head('1yprzb7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'AI Template | Edra';
		});
	});

	var header = $.child(div);
	var div_1 = $.child(header);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => resolve('/'));

		Button(node, {
			variant: 'ghost',
			size: 'icon',
			get href() {
				return $.get($0);
			},
			class: 'nodefault',
			children: ($$anchor, $$slotProps) => {
				ArrowLeft($$anchor, { class: 'size-4' });
			},
			$$slots: { default: true }
		});
	}

	$.next(2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	ToggleMode(node_1, {});
	$.reset(header);

	var main = $.sibling(header, 2);
	var div_2 = $.child(main);
	var node_2 = $.child(div_2);

	Edra(node_2, {
		get editor() {
			return editor;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			$.component(node_3, () => Edra.Toolbar, ($$anchor, Edra_Toolbar) => {
				Edra_Toolbar($$anchor, {
					class: 'h-fit max-w-full scrollbar-none overflow-x-scroll rounded-t-lg border-b bg-muted p-1 dark:bg-muted/50'
				});
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => Edra.UseAI, ($$anchor, Edra_UseAI) => {
				Edra_UseAI($$anchor, {});
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Edra.Content, ($$anchor, Edra_Content) => {
				Edra_Content($$anchor, {
					class: 'h-150 w-full cursor-auto overflow-y-scroll px-8 py-4 text-base *:outline-none'
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Edra.DragHandle, ($$anchor, Edra_DragHandle) => {
				Edra_DragHandle($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(main);

	var footer = $.sibling(main, 2);
	var span = $.sibling($.child(footer), 2);
	var text = $.only_child(span);

	$.reset(footer);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(words) ?? ''} words`));
	$.append($$anchor, div);
	$.pop();
}