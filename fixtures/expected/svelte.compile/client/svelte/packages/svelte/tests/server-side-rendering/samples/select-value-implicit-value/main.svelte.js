import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>--Please choose an option--</option><option>dog</option><option>cat</option></select>`);

export default function Main($$anchor) {
	var select = root();

	select.value = select.__value = 'dog';
	$.append($$anchor, select);
}