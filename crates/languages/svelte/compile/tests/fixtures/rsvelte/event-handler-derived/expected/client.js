import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button> <input/>`, 1);
export default function Event_handler_derived($$anchor) {
	let d = $.state(1);
	function make() {
		return () => $.update(d);
	}
	var fragment = root();
	var button = $.first_child(fragment);
	var event_handler = $.derived(make);
	var text = $.only_child(button, true);
	var input = $.sibling(button, 2);
	var event_handler_1 = $.derived(make);
	$.remove_input_defaults(input);
	$.effect(() => $.event("input", input, function(...$$args) {
		$.get(event_handler_1)?.apply(this, $$args);
	}));
	$.action(input, ($$node) => action?.($$node));
	$.template_effect(() => {
		$.set_text(text, $.get(d));
		$.set_value(input, $.get(d));
	});
	$.event("click", button, function(...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});
	$.append($$anchor, fragment);
}
