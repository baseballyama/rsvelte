import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Ripple from '@smui/ripple';

var root = $.from_html(`<div tabindex="0" role="button" class="svelte-wz4sgq">SMUI ripples can be added to arbitrary elements, like this <code>div</code> element. Try clicking it to see the ripple.</div>`);

export default function _Simple($$anchor) {
	var div = root();

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ surface: true }));
	$.append($$anchor, div);
}