import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Ripple from '@smui/ripple';

var root = $.from_html(`<div tabindex="0" role="button" class="svelte-1lkgrl5">Secondary color.</div>`);

export default function _SecondaryColor($$anchor) {
	var div = root();

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ surface: true, color: 'secondary' }));
	$.append($$anchor, div);
}