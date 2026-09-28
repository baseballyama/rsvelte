import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { createEditor, Edra } from '$lib/edra/headless/index.js';
import { ArrowLeft } from '@lucide/svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<!> Edra Headless`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<header class="demo-header svelte-6s3ww"><!> <!></header> <div class="demo-container svelte-6s3ww"><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_2();
	var header = $.first_child(fragment);
	var node = $.child(header);

	{
		let $0 = $.derived(() => resolve('/'));

		Button(node, {
			variant: 'ghost',
			class: 'nodefault',
			get href() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				ArrowLeft(node_1, {});
				$.next();
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node, 2);

	ToggleMode(node_2, {});
	$.reset(header);

	var div = $.sibling(header, 2);
	var node_3 = $.child(div);

	Edra(node_3, {
		get editor() {
			return editor;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => Edra.UseAI, ($$anchor, Edra_UseAI) => {
				Edra_UseAI($$anchor, {});
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Edra.Toolbar, ($$anchor, Edra_Toolbar) => {
				Edra_Toolbar($$anchor, { class: 'demo-toolbar' });
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Edra.BubbleMenu, ($$anchor, Edra_BubbleMenu) => {
				Edra_BubbleMenu($$anchor, {});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Edra.Content, ($$anchor, Edra_Content) => {
				Edra_Content($$anchor, { class: 'demo-content' });
			});

			var node_8 = $.sibling(node_7, 2);

			$.component(node_8, () => Edra.DragHandle, ($$anchor, Edra_DragHandle) => {
				Edra_DragHandle($$anchor, {});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}