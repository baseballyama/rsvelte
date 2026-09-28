import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { highlighter } from '$lib/components/highlighter.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Copy } from '@lucide/svelte';
import { onMount } from 'svelte';
import Tooltip from '../Tooltip.svelte';

var root = $.from_html(`<div class="group relative rounded-lg border-[0.5px] bg-muted p-1 shadow dark:bg-muted/30"><!> <!></div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	let highlightedCode = $.state('');
	let ref = $.state(null);

	onMount(() => {
		$.set(
			highlightedCode,
			highlighter.codeToHtml($$props.code, {
				lang: $$props.language,
				themes: { dark: 'github-dark', light: 'github-light' }
			}),
			true
		);
	});

	function copy() {
		const text = $.get(ref)?.children[1].textContent ?? '';

		navigator.clipboard.writeText(text);
	}

	var div = root();
	var node = $.child(div);

	Tooltip(node, {
		class: 'absolute top-2.5 right-1 opacity-0 transition-opacity group-hover:opacity-100',
		tooltip: 'Copy Code',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'ghost',
				size: 'icon-sm',
				onclick: copy,
				children: ($$anchor, $$slotProps) => {
					Copy($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.html(node_1, () => $.get(highlightedCode));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}