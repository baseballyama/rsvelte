import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
var root = $.from_html(`<p> </p>`);
export default function Dispatched_events($$anchor, $$props) {
	$.push($$props, true);
	const d = createEventDispatcher();
	d("go", 1);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $$props.a));
	$.append($$anchor, p);
	$.pop();
}
