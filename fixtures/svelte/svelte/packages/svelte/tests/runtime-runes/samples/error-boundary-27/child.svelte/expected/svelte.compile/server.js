import * as $ from 'svelte/internal/server';
import { get } from "./main.svelte";

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error } = $$props;
		const context = get();

		if (error) {
			$$renderer.push(`<!--[0--><p>caught: ${$.escape(error)} (${$.escape(context)})</p>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape((() => {
				throw 'catch me';
			})())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}