import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _8_3_$bindable_input($$anchor, $$props) {
	$.push($$props, true);

	let bindableProp = $.prop($$props, 'bindableProp', 11, 'fallback');

	$.pop();
}