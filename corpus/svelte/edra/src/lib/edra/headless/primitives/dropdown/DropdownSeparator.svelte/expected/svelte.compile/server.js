import * as $ from 'svelte/internal/server';

export default function DropdownSeparator($$renderer, $$props) {
	let { class: className = '' } = $$props;

	$$renderer.push(`<div${$.attr_class(`dropdown-separator ${$.stringify(className)}`, 'svelte-kr8n27')}></div>`);
}