import * as $ from 'svelte/internal/server';

import data from "./data.json" with { type: "json" };

export default function Import_attributes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p${$.attr_class($.clsx(data.value), 'svelte-zxtswk')}></p>`);
	});
}
