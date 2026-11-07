import * as $ from 'svelte/internal/server';

export default function DropdownShortcut($$renderer, $$props) {
	let { class: className = '', children } = $$props;

	$$renderer.push(`<span${$.attr_class(`dropdown-shortcut ${$.stringify(className)}`, 'svelte-71c1r8')}>`);
	children($$renderer);
	$$renderer.push(`<!----></span>`);
}