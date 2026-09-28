import * as $ from 'svelte/internal/server';
import List from "./helpers/SuggestDropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

export default function Combo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			id,
			options = [],
			textOptions = null,
			textField = "label",
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			clear = false,
			css = "",
			children: kids,
			onchange,
			dropdown = {}
		} = $$props;

		const inputId = getInputId(id);
		let filterActive = false;
		let textInput = "";

		let text = $.derived(() => {
			if (filterActive) return textInput;

			if (value || value === 0) {
				const option = (textOptions || options).find((a) => a.id === value);

				if (option) return option[textField];
			}

			return "";
		});

		let filteredOptions = $.derived(() => {
			if (!text() || !filterActive) return options;

			return options.filter((i) => i[textField].toLowerCase().includes(text().toLowerCase()));
		});

		let navigate;
		let keydown;

		function ready(ev) {
			navigate = ev.navigate;
			keydown = ev.keydown;
		}

		const index = () => filteredOptions().findIndex((a) => a.id === value);
		const onclick = () => navigate(index());
		const onkeydown = (e) => keydown(e, index());

		function selectByEvent({ id }) {
			doSelect(id, true);
		}

		function selectByText(chunk) {
			if (!options.length) return;

			if (chunk === "" && clear) {
				doUnselect();

				return;
			}

			let res = options.find((i) => i[textField] === chunk);

			if (!res) {
				res = options.find((i) => i[textField].toLowerCase().includes(chunk.toLowerCase()));
			}

			const id = res ? res.id : value || options[0].id;

			doSelect(id, false);
		}

		function doSelect(id, effects) {
			if (id || id === 0) {
				let selected = options.find((a) => a.id === id);

				filterActive = false;

				if (effects) navigate(null);

				if (selected && value !== selected.id) {
					value = selected.id;
					onchange && onchange({ value });
				}
			}

			if (!hasFocus && effects) inputElement.focus();
		}

		function doUnselect(ev) {
			if (ev) ev.stopPropagation();

			value = "";
			filterActive = false;
			onchange && onchange({ value });
		}

		function oninput() {
			textInput = inputElement.value;
			filterActive = true;

			if (filteredOptions().length) navigate(0);
		}

		let inputElement;
		let hasFocus;

		function onfocus() {
			hasFocus = true;
		}

		function onblur() {
			hasFocus = false;

			setTimeout(
				() => {
					if (!hasFocus) selectByText(text());
				},
				200
			);
		}

		$$renderer.push(`<div${$.attr_class(`wx-combo ${$.stringify(css)}`, 'svelte-7wd1iy')}${$.attr('title', title)}${$.attr('data-tooltip-text', tooltip)}><input${$.attr('id', inputId)}${$.attr('value', text())}${$.attr('disabled', disabled, true)}${$.attr('placeholder', placeholder)}${$.attr_class('svelte-7wd1iy', void 0, { 'wx-error': error })}/> `);

		if (clear && !disabled && value) {
			$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-7wd1iy"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="wx-icon wxi-angle-down svelte-7wd1iy"></i>`);
		}

		$$renderer.push(`<!--]--> `);

		if (!disabled) {
			$$renderer.push('<!--[0-->');

			{
				function children($$renderer, { option }) {
					if (kids) {
						$$renderer.push('<!--[0-->');
						kids($$renderer, { option });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(option[textField])}`);
					}

					$$renderer.push(`<!--]-->`);
				}

				List($$renderer, $.spread_props([
					{
						items: filteredOptions(),
						onready: ready,
						onselect: selectByEvent
					},
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