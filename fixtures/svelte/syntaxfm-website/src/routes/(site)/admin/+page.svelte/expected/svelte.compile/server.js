import * as $ from 'svelte/internal/server';
import ShowTable from '$/lib/ShowTable.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;

	let next_shows = $.derived(() => data.next_shows),
		last_9_shows = $.derived(() => data.last_9_shows);

	$$renderer.push(`<h2 class="h5">Next Shows</h2> `);
	ShowTable($$renderer, { shows: next_shows() });
	$$renderer.push(`<!----> <h2 class="h5">Last 9 Shows</h2> `);
	ShowTable($$renderer, { shows: last_9_shows() });
	$$renderer.push(`<!---->`);
}