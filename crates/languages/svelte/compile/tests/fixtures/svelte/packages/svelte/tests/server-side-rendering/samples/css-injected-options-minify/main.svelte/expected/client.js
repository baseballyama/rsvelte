import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-1h3glmj">foo</div>`);

const $$css = {
	hash: 'svelte-1h3glmj',
	code: '.foo.svelte-1h3glmj {color:green;}.foo.svelte-1h3glmj {color:green;} .foo.svelte-1h3glmj {color:green;}.foo.svelte-1h3glmj, .foo.svelte-1h3glmj {color:green;}'
};

export default function Main($$anchor) {
	$.append_styles($$anchor, $$css);

	var div = root();

	$.append($$anchor, div);
}