import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = "large",
			value = "",
			class: klass = "",
			defaultExpanded = false,
			children
		} = $$props;

		setContext("collapseItem", { size, value, defaultExpanded });
		$$renderer.push(`<div${$.attr_class(`w-full ${$.stringify(klass)}`)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}