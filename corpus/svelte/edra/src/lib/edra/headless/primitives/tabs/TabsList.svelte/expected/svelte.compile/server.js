import * as $ from 'svelte/internal/server';

export default function TabsList($$renderer, $$props) {
	let { class: className = '', children } = $$props;

	$$renderer.push(`<div${$.attr_class(`tabs-list ${$.stringify(className)}`, 'svelte-jdi39s')} role="tablist">`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}