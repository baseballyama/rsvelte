import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToggleButton from './ToggleButton.svelte';

var root = $.from_html(`<div class="input-output-toggle svelte-1pt4ts5">Direction: <span aria-hidden="true">LTR</span> <!> <span aria-hidden="true">RTL</span></div>`);

export default function RTLToggle($$anchor, $$props) {
	$.push($$props, true);

	let isRTL = $.prop($$props, 'isRTL', 15);

	function clicked() {
		document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
	}

	var div = root();
	var node = $.sibling($.child(div), 3);

	ToggleButton(node, {
		label: 'RTL direction',
		onclick: clicked,
		get pressed() {
			return isRTL();
		},

		set pressed($$value) {
			isRTL($$value);
		}
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}