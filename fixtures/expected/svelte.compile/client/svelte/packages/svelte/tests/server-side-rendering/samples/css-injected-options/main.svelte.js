import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-okauro">foo</div>`);

const $$css = {
	hash: 'svelte-okauro',
	code: '.foo.svelte-okauro {color:red;}'
};

export default function Main($$anchor) {
	$.append_styles($$anchor, $$css);

	var div = root();

	$.append($$anchor, div);
}