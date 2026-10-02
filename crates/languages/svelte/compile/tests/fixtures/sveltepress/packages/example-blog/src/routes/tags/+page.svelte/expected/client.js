import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { tags } from 'virtual:sveltepress/blog-tags-index';

var root = $.from_html(`<a class="sp-tag-pill svelte-2y1kba"> <span class="sp-tag-pill__count svelte-2y1kba"> </span></a>`);
var root_1 = $.from_html(`<div class="sp-tags-page svelte-2y1kba"><h1 class="sp-tags-page__title svelte-2y1kba">All Tags</h1> <div class="sp-tags-page__grid svelte-2y1kba"></div></div>`);

export default function _page($$anchor) {
	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => tags, $.index, ($$anchor, $$item) => {
		let name = () => $.get($$item).name;
		let count = () => $.get($$item).count;
		var a = root();
		var text = $.child(a);
		var span = $.sibling(text);
		var text_1 = $.only_child(span, true);

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `${base ?? ''}/tags/${name() ?? ''}/`);
			$.set_text(text, `#${name() ?? ''} `);
			$.set_text(text_1, count());
		});

		$.append($$anchor, a);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}