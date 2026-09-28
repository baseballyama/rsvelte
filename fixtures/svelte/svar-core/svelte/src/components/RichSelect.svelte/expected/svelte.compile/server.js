import * as $ from 'svelte/internal/server';
import List from "./helpers/SuggestDropdown.svelte";

export default function RichSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			options = [],
			textOptions = null,
			placeholder = "",
			disabled = false,
			error = false,
			title = "",
			tooltip,
			textField = "label",
			clear = false,
			css = "",
			children: kids,
			onchange,
			dropdown = {}
		} = $$props;

		let navigate;
		let keydown;

		function ready(ev) {
			navigate = ev.navigate;
			keydown = ev.keydown;
		}

		let selected = $.derived(() => value || value === 0
			? (textOptions || options).find((a) => a.id === value)
			: null);

		function select({ id }) {
			if (id || id === 0) {
				value = id;
				navigate(null);
				onchange && onchange({ value });
			}
		}

		function unselect(ev) {
			ev.stopPropagation();
			value = "";
			onchange && onchange({ value });
		}

		const index = () => options.findIndex((a) => a.id === value);

		$$renderer.push(`<div${$.attr_class(`wx-richselect ${$.stringify(css)}`, 'svelte-bh7w1q', {
			'wx-error': error,
			'wx-disabled': disabled,
			'wx-nowrap': !kids
		})}${$.attr('title', title)} tabindex="0"${$.attr('data-tooltip-text', tooltip)}><div class="wx-label svelte-bh7w1q">`);

		if (selected()) {
			$$renderer.push('<!--[0-->');

			if (kids) {
				$$renderer.push('<!--[0-->');
				kids($$renderer, selected());
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(selected()[textField])}`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (placeholder) {
			$$renderer.push(`<!--[1--><span class="wx-placeholder svelte-bh7w1q">${$.escape(placeholder)}</span>`);
		} else {
			$$renderer.push(`<!--[-1--> `);
		}

		$$renderer.push(`<!--]--></div> `);

		if (clear && !disabled && value) {
			$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-bh7w1q"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="wx-icon wxi-angle-down svelte-bh7w1q"></i>`);
		}

		$$renderer.push(`<!--]--> `);

		if (!disabled) {
			$$renderer.push('<!--[0-->');

			{
				function children($$renderer, { option }) {
					if (kids) {
						$$renderer.push('<!--[0-->');
						kids($$renderer, option);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(option[textField])}`);
					}

					$$renderer.push(`<!--]-->`);
				}

				List($$renderer, $.spread_props([
					{ items: options, onready: ready, onselect: select },
					dropdown,
					{ children, $$slots: { default: true } }
				]));
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}