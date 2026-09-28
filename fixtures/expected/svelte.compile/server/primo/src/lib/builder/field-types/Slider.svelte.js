import * as $ from 'svelte/internal/server';

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;
		const value = $.derived(() => entry?.value ?? '');

		$$renderer.push(`<div class="svelte-eoac43"><p class="label svelte-eoac43">${$.escape(field.label)}</p> <div class="container svelte-eoac43"><p class="value svelte-eoac43">${$.escape(value())}</p> <input class="input svelte-eoac43"${$.attr('value', value())} type="range"/></div></div>`);
	});
}