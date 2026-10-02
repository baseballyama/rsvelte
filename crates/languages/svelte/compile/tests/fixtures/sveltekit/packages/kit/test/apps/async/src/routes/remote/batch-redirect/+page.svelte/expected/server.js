import * as $ from 'svelte/internal/server';
import { batch_redirect } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let status = 'idle';

		async function run() {
			status = 'pending';

			try {
				await batch_redirect('a');
				status = 'resolved';
			} catch {
				status = 'rejected';
			}
		}

		$$renderer.push(`<button id="trigger">trigger</button> <p id="status">${$.escape(status)}</p>`);
	});
}