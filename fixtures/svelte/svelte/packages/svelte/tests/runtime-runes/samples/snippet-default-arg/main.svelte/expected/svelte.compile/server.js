import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function default_arg() {
			untrack(() => count++);

			return 1;
		}

		function item($$renderer, id = default_arg()) {
			$$renderer.push(`<div>${$.escape(id)} ${$.escape(id)} ${$.escape(id)}</div>`);
		}

		item($$renderer);
		$$renderer.push(`<!----> `);
		item($$renderer, 2);
		$$renderer.push(`<!----> `);
		item($$renderer);
		$$renderer.push(`<!----> <p>${$.escape(count)}</p>`);
	});
}