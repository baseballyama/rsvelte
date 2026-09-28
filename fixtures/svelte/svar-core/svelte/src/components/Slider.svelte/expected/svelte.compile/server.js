import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			label = "",
			width = "",
			min = 0,
			max = 100,
			value = 0,
			step = 1,
			title = "",
			tooltip,
			disabled = false,
			css = "",
			onchange
		} = $$props;

		const inputId = getInputId(id);

		let bgStyle = $.derived(() => () => {
			return disabled
				? ""
				: `background: linear-gradient(90deg, var(--wx-slider-primary) 0% ${progress()}, var(--wx-slider-background) ${progress()} 100%);`;
		});

		let progress = $.derived(() => (value - min) / (max - min) * 100 + "%");
		let previousInput = value;
		let previousValue = value;

		function oninput({ target }) {
			value = target.value * 1;
			onchange && onchange({ value, previous: previousInput, input: true });
			previousInput = value;
		}

		function change({ target }) {
			value = target.value * 1;
			onchange && onchange({ value, previous: previousValue });
			previousValue = value;
		}

		$$renderer.push(`<div${$.attr_class(`wx-slider ${$.stringify(css)}`, 'svelte-1082wop')}${$.attr_style(width ? `width: ${width}` : "")}${$.attr('title', title)}${$.attr('data-tooltip-text', tooltip)}>`);

		if (label) {
			$$renderer.push(`<!--[0--><label${$.attr('for', id)} class="svelte-1082wop">${$.escape(label)}</label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="svelte-1082wop"><input${$.attr('id', inputId)} type="range"${$.attr('min', min)}${$.attr('max', max)}${$.attr('step', step)}${$.attr('disabled', disabled, true)}${$.attr('value', value)}${$.attr_style(bgStyle()())} class="svelte-1082wop"/></div></div>`);
		$.bind_props($$props, { value });
	});
}