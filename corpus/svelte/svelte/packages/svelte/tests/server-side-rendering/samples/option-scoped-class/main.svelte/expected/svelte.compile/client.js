import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option class="opt svelte-rgsspy">foo</option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option = $.child(select);

	option.value = option.__value = 'foo';
	$.reset(select);
	select.value = select.__value = 'foo';
	$.append($$anchor, select);
}