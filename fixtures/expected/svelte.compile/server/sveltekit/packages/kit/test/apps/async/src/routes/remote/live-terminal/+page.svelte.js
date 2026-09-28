import * as $ from 'svelte/internal/server';
import { get_value, get_connection_count, trigger } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const live = get_value();
		let connections = 'pending';

		async function refresh_connections() {
			connections = String(await get_connection_count());
		}

		$$renderer.push(`<button id="trigger-error">trigger error</button> <button id="trigger-redirect">trigger redirect</button> <button id="trigger-yield">trigger yield</button> <button id="refresh-connections">refresh connections</button> <p id="value">${$.escape(live.current)}</p> <p id="error">${$.escape(live.error ? `${live.error.status} ${live.error.message}` : '')}</p> <p id="connected">${$.escape(String(live.connected))}</p> <p id="done">${$.escape(String(live.done))}</p> <p id="connections">${$.escape(connections)}</p>`);
	});
}