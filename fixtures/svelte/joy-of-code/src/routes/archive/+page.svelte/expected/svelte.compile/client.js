import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Heading from '$lib/ui/heading.svelte';
import { fade } from 'svelte/transition';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<div><a class="svelte-1d6nxft"><article class="post svelte-1d6nxft"><div class="details"><span class="title svelte-1d6nxft"> </span></div></article></a></div>`);
var root_2 = $.from_html(`<!> <section class="svelte-1d6nxft"><div class="container svelte-1d6nxft"><h3>Posts</h3> <div><span class="results svelte-1d6nxft"> </span> results</div></div> <div class="posts svelte-1d6nxft"></div></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();

	$.head('1d6nxft', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `List of ${$$props.data.posts.length ?? ''} posts.`));

		$.effect(() => {
			$.document.title = 'Archive';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	Heading(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Archive');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var section = $.sibling(node, 2);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var span = $.child(div_1);
	var text_1 = $.only_child(span, true);

	$.next();
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);

	$.each(div_2, 21, () => $$props.data.posts, $.index, ($$anchor, post, i) => {
		var div_3 = root_1();
		var a = $.child(div_3);
		var article = $.child(a);
		var div_4 = $.child(article);
		var span_1 = $.child(div_4);
		let styles;
		var text_2 = $.only_child(span_1, true);

		$.reset(div_4);
		$.reset(article);
		$.reset(a);
		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/${$.get(post).slug ?? ''}`);
			styles = $.set_style(span_1, '', styles, { '--view-transition-name': $.get(post).slug });
			$.set_text(text_2, $.get(post).title);
		});

		$.transition(1, div_3, () => fade, () => ({ duration: 300, delay: i < 10 ? 100 * i : 100 * 4 }));
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(section);
	$.template_effect(() => $.set_text(text_1, $$props.data.posts.length));
	$.append($$anchor, fragment);
	$.pop();
}