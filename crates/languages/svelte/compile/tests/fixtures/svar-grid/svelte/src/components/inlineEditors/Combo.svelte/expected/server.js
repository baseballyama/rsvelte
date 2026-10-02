import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";

export default function Combo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onaction, onsave, onapply, oncancel } = $$props;

		let tmp = editor,
			value = tmp.value,
			text = tmp.renderedValue,
			filterOptions = tmp.options;

		let tmp_1 = editor?.config || {},
			template = tmp_1.template,
			cell = tmp_1.cell,
			dropdown = $.fallback(tmp_1.dropdown, () => ({}), true);

		const dropdownOptions = $.derived(() => ({ trackScroll: true, ...dropdown }));
		let index = $.derived(() => filterOptions.findIndex((a) => a.id === value));

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

		function input() {
			filterOptions = text
				? editor.options.filter((i) => i.label.toLowerCase().includes(text.toLowerCase()))
				: editor.options;

			if (filterOptions.length) navigate(-Infinity); else navigate(null);
		}

		let node = void 0;

		onMount(() => {
			node.focus();
		});

		$$renderer.push(`<input class="wx-input svelte-19odm8k"${$.attr('value', text)}/> `);

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
				{ items: filterOptions, onready: ready, onselect: updateValue },
				dropdownOptions(),
				{
					oncancel: () => oncancel(true),
					children,
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!---->`);
	});
}