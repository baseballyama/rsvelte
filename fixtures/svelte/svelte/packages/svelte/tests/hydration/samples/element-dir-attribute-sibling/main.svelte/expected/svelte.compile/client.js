import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p dir="rtl">text</p>.`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	$.next();
	$.template_effect(() => p.dir = p.dir);
	$.append($$anchor, fragment);
}