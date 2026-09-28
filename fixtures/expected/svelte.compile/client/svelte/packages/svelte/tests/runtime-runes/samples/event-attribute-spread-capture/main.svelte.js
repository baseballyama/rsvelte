import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button>click me</button> <p> </p></div>`);

export default function Main($$anchor) {
	let captured = $.state(false);

	const properties = {
		/** @param {MouseEvent} event */
		onclickcapture: (event) => {
			$.set(captured, event.eventPhase === event.CAPTURING_PHASE);
		}
	};

	var div = root();

	$.attribute_effect(div, () => ({ ...properties }));

	var p = $.sibling($.child(div), 2);
	var text = $.only_child(p);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `captured: ${$.get(captured) ?? ''}`));
	$.append($$anchor, div);
}