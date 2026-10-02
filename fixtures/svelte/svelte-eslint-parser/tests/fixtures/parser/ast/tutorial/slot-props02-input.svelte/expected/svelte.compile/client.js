import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Slot_props02_input($$anchor, $$props) {
	let hovering;

	function enter() {
		hovering = true;
	}

	function leave() {
		hovering = false;
	}

	var div = root();
	var node = $.child(div);

	$.slot(
		node,
		$$props,
		'default',
		{
			get hovering() {
				return hovering;
			}
		},
		null
	);

	$.reset(div);
	$.event('mouseenter', div, enter);
	$.event('mouseleave', div, leave);
	$.append($$anchor, div);
}