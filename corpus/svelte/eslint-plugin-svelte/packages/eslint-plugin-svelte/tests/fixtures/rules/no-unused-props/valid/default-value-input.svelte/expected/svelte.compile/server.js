import * as $ from 'svelte/internal/server';

export default function Default_value_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { newTaskAttributes = { attribute: 0, attribute2: '' } } = $$props;

		$$renderer.push(`<div class="col-span-full"><div>${$.escape(newTaskAttributes.attribute)}
		${$.escape(newTaskAttributes.attribute2)}</div></div>`);
	});
}