import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Calendar, Dropdown } from "@svar-ui/svelte-core";

export default function Datepicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onaction, onsave, onapply, oncancel } = $$props;
		let value = editor.value || new Date();

		let tmp = editor?.config || {},
			template = tmp.template,
			cell = tmp.cell,
			dropdown = $.fallback(tmp.dropdown, () => ({}), true);

		const dropdownOptions = $.derived(() => ({ trackScroll: true, width: "auto", ...dropdown }));

		function updateValue({ value }) {
			onapply(value);
			onsave();
		}

		let node;

		onMount(() => {
			node.focus();

			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
		});

		$$renderer.push(`<div class="wx-value svelte-1vdx3gg" tabindex="0">`);

		if (template) {
			$$renderer.push(`<!--[0-->${$.escape(template(value))}`);
		} else if (cell) {
			$$renderer.push('<!--[1-->');

			const SvelteComponent = cell;

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');
				SvelteComponent($$renderer, { data: editor.value, onaction });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1--><span class="wx-text svelte-1vdx3gg">${$.escape(editor.renderedValue)}</span>`);
		}

		$$renderer.push(`<!--]--></div> `);

		Dropdown($$renderer, $.spread_props([
			dropdownOptions(),
			{
				oncancel: () => oncancel(true),
				children: ($$renderer) => {
					Calendar($$renderer, {
						value,
						onchange: updateValue,
						buttons: editor.config?.buttons
					});
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push(`<!---->`);
	});
}