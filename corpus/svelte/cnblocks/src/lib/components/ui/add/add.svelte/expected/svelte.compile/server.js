import * as $ from 'svelte/internal/server';
import { useAdd } from "./add.svelte.js";
import { box } from "svelte-toolbelt";

export default function Add($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, withoutRegistry = false, children } = $$props;

		useAdd({
			item: box.with(() => item),
			withoutRegistry: box.with(() => withoutRegistry)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}