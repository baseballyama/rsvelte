import * as $ from 'svelte/internal/server';
import { highlighter } from '$lib/components/highlighter.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Copy } from '@lucide/svelte';
import { onMount } from 'svelte';
import Tooltip from '../Tooltip.svelte';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { code, language } = $$props;
		let highlightedCode = '';
		let ref = null;

		onMount(() => {
			highlightedCode = highlighter.codeToHtml(code, {
				lang: language,
				themes: { dark: 'github-dark', light: 'github-light' }
			});
		});

		function copy() {
			const text = ref?.children[1].textContent ?? '';

			navigator.clipboard.writeText(text);
		}

		$$renderer.push(`<div class="group relative rounded-lg border-[0.5px] bg-muted p-1 shadow dark:bg-muted/30">`);

		Tooltip($$renderer, {
			class: 'absolute top-2.5 right-1 opacity-0 transition-opacity group-hover:opacity-100',
			tooltip: 'Copy Code',
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'ghost',
					size: 'icon-sm',
					onclick: copy,
					children: ($$renderer) => {
						Copy($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> ${$.html(highlightedCode)}</div>`);
	});
}