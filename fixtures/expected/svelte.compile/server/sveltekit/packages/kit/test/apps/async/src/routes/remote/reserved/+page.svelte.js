import * as $ from 'svelte/internal/server';
import * as reserved from './reserved.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let result = 'pending';

		async function run() {
			const del = await reserved.delete();
			const cls = await reserved.class();
			const ret = await reserved.return();

			result = `${del}/${cls}/${ret}`;
		}

		$$renderer.push(`<p id="reserved-result">${$.escape(result)}</p> <button id="reserved-run">run</button>`);
	});
}