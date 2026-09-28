import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<table class="abc"><tbody><tr><td>Hello world</td></tr></tbody></table>`);

export default function Main($$anchor) {
	var table = root();

	$.append($$anchor, table);
}