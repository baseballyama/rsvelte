import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor) => {
	var style = root();

	$.append($$anchor, style);
};

var root = $.from_html(`<style>span { color: green; }</style>`);

export default function Nested_in_snippet_input($$anchor) {}