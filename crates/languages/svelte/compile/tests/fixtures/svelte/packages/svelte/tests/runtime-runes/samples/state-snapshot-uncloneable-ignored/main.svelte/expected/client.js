import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>a</div>`);

export default function Main($$anchor) {
	let arr = $.proxy({ test: () => {} });

	// svelte-ignore state_snapshot_uncloneable
	$.snapshot(arr);

	var div = root();

	$.attribute_effect(div, ($0) => ({ ...$0 }), [() => $.snapshot(arr)]);
	$.append($$anchor, div);
}