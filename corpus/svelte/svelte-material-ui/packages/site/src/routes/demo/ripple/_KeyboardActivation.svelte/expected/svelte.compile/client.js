import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Ripple from '@smui/ripple';

var root = $.from_html(`<div tabindex="0" role="button" class="svelte-180xget">Keyboard activation on an arbitrary element. (Focus and press space/enter.)</div>`);

export default function _KeyboardActivation($$anchor) {
	let active = $.state(false);
	var div = root();

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ surface: true, active: $.get(active) }));
	$.event('mousedown', div, () => $.set(active, true), true);
	$.event('mouseup', div, () => $.set(active, false), true);
	$.event('keydown', div, (e) => $.set(active, e.code === 'Space' || e.code === 'Enter', true), true);
	$.event('keyup', div, () => $.set(active, false), true);
	$.append($$anchor, div);
}