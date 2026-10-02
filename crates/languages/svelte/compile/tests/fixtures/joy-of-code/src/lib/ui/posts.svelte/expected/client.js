import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { formatDate } from '$lib/utils';

var root = $.from_html(`<div><article class="card svelte-55b60l"><a class="svelte-55b60l"><div class="title svelte-55b60l"> </div></a> <div class="published svelte-55b60l"> </div> <p class="description svelte-55b60l"> </p></article></div>`);
var root_1 = $.from_html(`<section class="svelte-55b60l"><!> <div class="cards"></div> <!></section>`);

export default function Posts($$anchor, $$props) {
	$.push($$props, true);

	var section = root_1();
	var node = $.child(section);

	$.snippet(node, () => $$props.title ?? $.noop);

	var div = $.sibling(node, 2);

	$.each(div, 21, () => $$props.posts, $.index, ($$anchor, post, i) => {
		var div_1 = root();
		var article = $.child(div_1);
		var a = $.child(article);
		var div_2 = $.child(a);
		let styles;
		var text = $.only_child(div_2, true);

		$.reset(a);

		var div_3 = $.sibling(a, 2);
		var text_1 = $.only_child(div_3);
		var p = $.sibling(div_3, 2);
		var text_2 = $.only_child(p, true);

		$.reset(article);
		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', `/${$.get(post).slug ?? ''}`);
				styles = $.set_style(div_2, '', styles, { 'view-transition-name': $.get(post).slug });
				$.set_text(text, $.get(post).title);
				$.set_text(text_1, `Published ${$0 ?? ''}`);
				$.set_text(text_2, $.get(post).description);
			},
			[() => formatDate($.get(post).published)]
		);

		$.transition(1, div_1, () => fade, () => ({ duration: 300, delay: i < 4 ? 100 * i : 100 * 4 }));
		$.append($$anchor, div_1);
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => $$props.more ?? $.noop);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}