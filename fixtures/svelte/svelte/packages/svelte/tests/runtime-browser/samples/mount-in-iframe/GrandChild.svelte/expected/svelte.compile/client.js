import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1mg240x">inner</h1>`);

const $$css = {
	hash: 'svelte-1mg240x',
	code: 'h1.svelte-1mg240x {color:blue;}'
};

export default function GrandChild($$anchor) {
	$.append_styles($$anchor, $$css);

	var h1 = root();

	$.append($$anchor, h1);
}