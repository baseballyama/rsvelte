import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Script_directive_prologue($$anchor, $$props) {
	$.push($$props, true);
	"use strict";
	let b = $.state(0);
	$.user_effect(() => {
		$.set(b, $$props.a, true);
	});
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $.get(b)));
	$.append($$anchor, p);
	$.pop();
}
