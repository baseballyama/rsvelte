import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { createEditor, Edra } from '$lib/edra/shadcn/index.js';
import { onMount } from 'svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft, Columns2 } from '@lucide/svelte';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex min-h-screen flex-col bg-background text-foreground"><header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur"><div class="flex items-center gap-3"><!> <span class="max-w-40 truncate text-sm font-semibold md:max-w-64"> </span></div> <div class="flex items-center gap-2"><!> <!></div></header> <div><!></div> <main class="flex-1 grow overflow-y-auto pb-32"><div><input type="text" class="w-full border-hidden bg-transparent text-4xl font-bold tracking-tight outline-hidden placeholder:opacity-20 focus:ring-0" placeholder="Untitled Workspace"/></div> <!></main></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let pageTitle = $.state('Notion-Like Workspace');
	let fullWidth = $.state(false);

	// Mock covers list
	const covers = [
		'from-pink-500 via-red-500 to-yellow-500',
		'from-green-400 to-blue-600',
		'from-purple-600 to-indigo-600',
		'from-indigo-400 via-purple-400 to-pink-400'
	];

	let activeCoverIndex = $.state(0);

	function changeCover() {
		$.set(activeCoverIndex, ($.get(activeCoverIndex) + 1) % covers.length);
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

	var div = root_2();

	$.head('1ot1wcu', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${($.get(pageTitle) || 'Untitled') ?? ''} | Edra Workspace`;
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

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Button(node_1, {
		variant: 'ghost',
		size: 'sm',
		onclick: () => $.set(fullWidth, !$.get(fullWidth)),
		class: 'h-8 gap-1.5 text-xs',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Columns2(node_2, { class: 'size-3.5' });

			var span_1 = $.sibling(node_2, 2);
			var text_1 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(fullWidth) ? 'Standard Width' : 'Full Width'));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	ToggleMode(node_3, {});
	$.reset(div_2);
	$.reset(header);

	var div_3 = $.sibling(header, 2);
	var node_4 = $.child(div_3);

	Button(node_4, {
		variant: 'outline',
		size: 'sm',
		onclick: changeCover,
		class: 'absolute right-6 bottom-4 h-8 border bg-background/90 text-xs opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:bg-background',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Change cover');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var main = $.sibling(div_3, 2);
	var div_4 = $.child(main);
	var input = $.child(div_4);

	$.remove_input_defaults(input);
	$.reset(div_4);

	var node_5 = $.sibling(div_4, 2);

	Edra(node_5, {
		get editor() {
			return editor;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_6 = $.first_child(fragment_2);

			$.component(node_6, () => Edra.UseAI, ($$anchor, Edra_UseAI) => {
				Edra_UseAI($$anchor, {});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Edra.ToC, ($$anchor, Edra_ToC) => {
				Edra_ToC($$anchor, {});
			});

			var node_8 = $.sibling(node_7, 2);

			$.component(node_8, () => Edra.BubbleMenu, ($$anchor, Edra_BubbleMenu) => {
				Edra_BubbleMenu($$anchor, {});
			});

			var node_9 = $.sibling(node_8, 2);

			{
				let $0 = $.derived(() => cn('mx-auto w-full cursor-auto px-8 py-4 text-base transition-all duration-300 *:outline-none', $.get(fullWidth) ? 'max-w-full' : 'max-w-3xl'));

				$.component(node_9, () => Edra.Content, ($$anchor, Edra_Content) => {
					Edra_Content($$anchor, {
						get class() {
							return $.get($0);
						}
					});
				});
			}

			var node_10 = $.sibling(node_9, 2);

			$.component(node_10, () => Edra.DragHandle, ($$anchor, Edra_DragHandle) => {
				Edra_DragHandle($$anchor, { type: 'extended', class: 'transition-all! duration-300!' });
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $.get(pageTitle) || 'Untitled');
			$.set_class(div_3, 1, $0);
			$.set_class(div_4, 1, $1);
		},
		[
			() => $.clsx(cn('group relative h-48 w-full bg-linear-to-r transition-all! duration-500!', covers[$.get(activeCoverIndex)])),
			() => $.clsx(cn('mx-auto mb-6 border-b border-border/40 px-8 pt-10 pb-4 transition-all duration-300 md:px-16', $.get(fullWidth) ? 'max-w-full' : 'max-w-3xl'))
		]
	);

	$.bind_value(input, () => $.get(pageTitle), ($$value) => $.set(pageTitle, $$value));
	$.append($$anchor, div);
	$.pop();
}