import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Forwarded_events($$anchor, $$props) {
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, $$props.a));
	$.event("click", button, function($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});
	$.append($$anchor, button);
}
