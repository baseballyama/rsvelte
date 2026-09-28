import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Ripple from '@smui/ripple';

var root = $.from_html(`<div tabindex="0" role="button" class="svelte-1d3jlhp">Primary color.</div>`);

export default function _PrimaryColor($$anchor) {
	var div = root();

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ surface: true, color: 'primary' }));
	$.append($$anchor, div);
}