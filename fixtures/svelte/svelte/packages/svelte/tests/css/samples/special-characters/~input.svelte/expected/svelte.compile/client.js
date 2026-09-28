import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<x class="svelte-1xbc75l"></x>`);

export default function Input($$anchor) {
	var x = root();

	$.set_attribute(x, 'foo', '{;}');
	$.append($$anchor, x);
}