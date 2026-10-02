import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a sapper:prefetch=""></a>`);

export default function Input($$anchor) {
	var a = root();

	$.append($$anchor, a);
}