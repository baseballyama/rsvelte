import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from "./foo-state.svelte";

var root = $.from_html(`<p> </p>`);

export default function Foo($$anchor) {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, count));
	$.append($$anchor, p);
}