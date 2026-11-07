import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _8_4_$bindable_ts_input($$anchor, $$props) {
	$.push($$props, true);

	let bindableProp = $.prop($$props, 'bindableProp', 11, 42);

	$.pop();
}