import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 31, () => $.proxy([]));

	rows(rows()[$$props.row] = '', true);
	$.pop();
}