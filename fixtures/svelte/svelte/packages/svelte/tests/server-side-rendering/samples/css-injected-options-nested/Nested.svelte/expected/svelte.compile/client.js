import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="bar svelte-lr8eda">bar</div>`);

const $$css = {
	hash: 'svelte-lr8eda',
	code: '.bar.svelte-lr8eda {color:red;}'
};

export default function Nested($$anchor) {
	$.append_styles($$anchor, $$css);

	var div = root();

	$.append($$anchor, div);
}