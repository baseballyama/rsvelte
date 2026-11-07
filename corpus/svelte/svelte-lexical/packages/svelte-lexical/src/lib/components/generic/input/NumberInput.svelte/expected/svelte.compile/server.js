import * as $ from 'svelte/internal/server';

export default function NumberInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			dataTestId = undefined,
			label,
			placeholder = '',
			value = void 0,
			id = '',
			onChange = undefined,
			width = undefined
		} = $$props;

		$$renderer.push(`<div class="Input__wrapper"><label class="Input__label"${$.attr('for', id)}>${$.escape(label)}</label> <input type="number" class="Input__input"${$.attr_style(`width: ${$.stringify(width)};`)}${$.attr('placeholder', placeholder)}${$.attr('value', value)}${$.attr('data-test-id', dataTestId)}${$.attr('id', id)}/></div>`);
		$.bind_props($$props, { value });
	});
}