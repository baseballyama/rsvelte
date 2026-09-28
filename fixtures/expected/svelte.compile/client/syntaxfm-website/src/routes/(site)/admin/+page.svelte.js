import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ShowTable from '$/lib/ShowTable.svelte';

var root = $.from_html(`<h2 class="h5">Next Shows</h2> <!> <h2 class="h5">Last 9 Shows</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	let next_shows = $.derived(() => $$props.data.next_shows),
		last_9_shows = $.derived(() => $$props.data.last_9_shows);

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ShowTable(node, {
		get shows() {
			return $.get(next_shows);
		}
	});

	var node_1 = $.sibling(node, 4);

	ShowTable(node_1, {
		get shows() {
			return $.get(last_9_shows);
		}
	});

	$.append($$anchor, fragment);
}