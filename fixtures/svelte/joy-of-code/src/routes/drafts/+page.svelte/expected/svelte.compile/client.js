import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import Heading from '$lib/ui/heading.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<div><a class="svelte-1nln88x"><article class="post svelte-1nln88x"><div class="details"><span class="title svelte-1nln88x"> </span></div></article></a></div>`);
var root_2 = $.from_html(`<!> <section class="svelte-1nln88x"><div class="container svelte-1nln88x"><h3>Drafts</h3> <div><span class="results svelte-1nln88x"> </span> results</div></div> <div class="posts svelte-1nln88x"></div></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();

	$.head('1nln88x', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `List of ${$$props.data.posts.length ?? ''} posts.`));

		$.effect(() => {
			$.document.title = 'Drafts';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	Heading(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Drafts');

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
		var text_2 = $.only_child(span_1, true);

		$.reset(div_4);
		$.reset(article);
		$.reset(a);
		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/drafts/${$.get(post).slug ?? ''}`);
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