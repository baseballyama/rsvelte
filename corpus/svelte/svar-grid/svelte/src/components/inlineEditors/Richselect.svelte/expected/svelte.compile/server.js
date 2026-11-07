import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";
import { clickOutside } from "@svar-ui/lib-dom";

export default function Richselect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onaction, onsave, onapply, oncancel } = $$props;
		let data = editor.options.find((opt) => opt.id === editor.value);

		let tmp = editor,
			value = tmp.value,
			options = tmp.options;

		let tmp_1 = editor?.config || {},
			template = tmp_1.template,
			cell = tmp_1.cell,
			dropdown = $.fallback(tmp_1.dropdown, () => ({}), true);

		const dropdownOptions = $.derived(() => ({ trackScroll: true, ...dropdown }));
		let index = $.derived(() => options.findIndex((a) => a.id === value));

		function updateValue({ id }) {
			onapply(id);
			onsave();
		}

		let navigate;
		let keydown = void 0;

		function ready(ev) {
			navigate = ev.navigate;
			keydown = ev.keydown;
			navigate(index());
		}

		let node = void 0;

		onMount(() => {
			node.focus();

			if (window && window.getSelection) {
				window.getSelection().removeAllRanges();
			}
		});

		$$renderer.push(`<div class="wx-value svelte-1kf9vkg" tabindex="0">`);

		if (template) {
			$$renderer.push(`<!--[0-->${$.escape(template(data))}`);
		} else if (cell) {
			$$renderer.push('<!--[1-->');

			const SvelteComponent = cell;

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');
				SvelteComponent($$renderer, { data, onaction });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1--><span class="wx-text svelte-1kf9vkg">${$.escape(editor.renderedValue)}</span>`);
		}

		$$renderer.push(`<!--]--></div> `);

		{
			function children($$renderer, { option }) {
				if (template) {
					$$renderer.push(`<!--[0-->${$.escape(template(option))}`);
				} else if (cell) {
					$$renderer.push('<!--[1-->');

					const SvelteComponent_1 = cell;

					if (SvelteComponent_1) {
						$$renderer.push('<!--[-->');
						SvelteComponent_1($$renderer, { data: option, onaction });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(option.label)}`);
				}

				$$renderer.push(`<!--]-->`);
			}

			SuggestDropdown($$renderer, $.spread_props([
				{ items: options, onready: ready, onselect: updateValue },
				dropdownOptions(),
				{ children, $$slots: { default: true } }
			]));
		}

		$$renderer.push(`<!---->`);
	});
}