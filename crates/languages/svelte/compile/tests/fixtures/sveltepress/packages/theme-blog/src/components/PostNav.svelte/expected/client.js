import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<a class="sp-post-nav__item sp-post-nav__item--prev svelte-1f3exj4"><span class="sp-post-nav__dir svelte-1f3exj4">← 上一篇</span> <span class="sp-post-nav__title svelte-1f3exj4"> </span></a>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<a class="sp-post-nav__item sp-post-nav__item--next svelte-1f3exj4"><span class="sp-post-nav__dir svelte-1f3exj4">下一篇 →</span> <span class="sp-post-nav__title svelte-1f3exj4"> </span></a>`);
var root_3 = $.from_html(`<nav class="sp-post-nav svelte-1f3exj4"><!> <!></nav>`);

export default function PostNav($$anchor, $$props) {
	$.push($$props, true);

	var nav = root_3();
	var node = $.child(nav);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var span = $.sibling($.child(a), 2);
			var text = $.only_child(span, true);

			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `${base}/posts/${$$props.prev.slug}/`);
				$.set_text(text, $$props.prev.title);
			});

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var div = root_1();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.prev) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_2();
			var span_1 = $.sibling($.child(a_1), 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(a_1);

			$.template_effect(() => {
				$.set_attribute(a_1, 'href', `${base}/posts/${$$props.next.slug}/`);
				$.set_text(text_1, $$props.next.title);
			});

			$.append($$anchor, a_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.next) $$render(consequent_1);
		});
	}

	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}