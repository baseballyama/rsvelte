import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let c = $.prop($$props, 'c', 11, 0);

	$.pop();
}