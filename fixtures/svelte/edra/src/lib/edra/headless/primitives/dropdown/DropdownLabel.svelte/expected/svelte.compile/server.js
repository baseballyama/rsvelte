import * as $ from 'svelte/internal/server';

export default function DropdownLabel($$renderer, $$props) {
	let { class: className = '', children } = $$props;

	$$renderer.push(`<div${$.attr_class(`dropdown-label ${$.stringify(className)}`, 'svelte-e8c13o')}>`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}