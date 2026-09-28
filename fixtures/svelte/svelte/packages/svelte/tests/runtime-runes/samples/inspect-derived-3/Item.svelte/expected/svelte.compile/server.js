import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, value } = $$props;
		let listContext = getContext('list');
		let selected = $.derived(() => listContext?.selectedValue === value);

		;;
		$$renderer.push(`<div${$.attr_class('', void 0, { 'selected': selected() })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}