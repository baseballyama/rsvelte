import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";

export default function MultiSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = [],
			options = [],
			placeholder = "",
			clear = false,
			text = null,
			template = null,
			cell = null,
			dropdown = {},
			autoOpen = false,
			onchange,
			onaction
		} = $$props;

		const selected = $.derived(() => (value || []).map((id) => options.find((o) => o.id === id)).filter(Boolean));
		let node = void 0;
		let navigate;
		let keydown;

		function ready(ev) {
			navigate = ev.navigate;
			keydown = ev.keydown;

			if (autoOpen) navigate(index());
		}

		onMount(() => {
			if (autoOpen) {
				node?.focus();

				if (window?.getSelection) window.getSelection().removeAllRanges();
			}
		});

		const index = () => {
			const v = value || [];

			if (!v.length) return 0;

			const firstSelected = options.find((o) => v.includes(o.id));

			return firstSelected ? options.indexOf(firstSelected) : 0;
		};

		function select({ id }) {
			value = id;
			onchange && onchange({ value });
		}

		function unselect(ev) {
			ev.stopPropagation();
			value = [];
			onchange && onchange({ value });
		}

		function onclick() {
			navigate?.(index());
		}

		function oncancel() {
			navigate?.(null);
		}

		$$renderer.push(`<div class="wx-multiselect svelte-nmwr83" tabindex="0"><div class="wx-label svelte-nmwr83">`);

		if (template) {
			$$renderer.push(`<!--[0-->${$.escape(template(selected()))}`);
		} else if (cell) {
			$$renderer.push('<!--[1-->');

			const CellComponent = cell;

			if (CellComponent) {
				$$renderer.push('<!--[-->');
				CellComponent($$renderer, { data: selected(), onaction });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (text) {
			$$renderer.push(`<!--[2--><span class="wx-text svelte-nmwr83">${$.escape(text)}</span>`);
		} else if (selected().length) {
			$$renderer.push(`<!--[3--><span class="wx-text svelte-nmwr83">${$.escape(selected().map((s) => s.label).join(", "))}</span>`);
		} else if (placeholder) {
			$$renderer.push(`<!--[4--><span class="wx-placeholder svelte-nmwr83">${$.escape(placeholder)}</span>`);
		} else {
			$$renderer.push(`<!--[-1--> `);
		}

		$$renderer.push(`<!--]--></div> `);

		if (clear && value?.length) {
			$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-nmwr83"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="wx-icon wxi-angle-down svelte-nmwr83"></i>`);
		}

		$$renderer.push(`<!--]--> `);

		{
			function children($$renderer, { option }) {
				$$renderer.push(`<div class="wx-option svelte-nmwr83">`);

				if (template) {
					$$renderer.push(`<!--[0-->${$.escape(template(option))}`);
				} else if (cell) {
					$$renderer.push('<!--[1-->');

					const CellComponent = cell;

					if (CellComponent) {
						$$renderer.push('<!--[-->');
						CellComponent($$renderer, { data: option, onaction });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(option.label)}`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			SuggestDropdown($$renderer, $.spread_props([
				{
					items: options,
					onready: ready,
					onselect: select,
					multiselect: true,
					checkboxes: true,
					value: value || [],
					oncancel
				},
				dropdown,
				{ children, $$slots: { default: true } }
			]));
		}

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { value });
	});
}