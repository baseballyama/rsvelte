import * as $ from 'svelte/internal/server';
import { get_count } from '../../query-command.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let status = 'idle';
		let result = '';
		let stored;

		function get_message(error) {
			return error instanceof Error ? error.message : String(error);
		}

		$$renderer.push(`<p id="status">${$.escape(status)}</p> <p id="result">${$.escape(result)}</p> <button id="create">create query</button> <button id="await">await query</button> <button id="read-current">read current</button>`);
	});
}