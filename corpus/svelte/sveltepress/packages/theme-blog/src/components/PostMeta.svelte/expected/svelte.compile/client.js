import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<img class="sp-post-meta__avatar svelte-ah1ck6" alt="" width="24" height="24"/>`);
var root_1 = $.from_html(`<span class="sp-post-meta__author svelte-ah1ck6">By <b class="svelte-ah1ck6"> </b></span> <span class="sp-post-meta__sep svelte-ah1ck6">·</span>`, 1);
var root_2 = $.from_html(`<span class="sp-post-meta__sep svelte-ah1ck6">·</span> <span class="sp-post-meta__filed svelte-ah1ck6">Filed under <b class="svelte-ah1ck6"> </b></span>`, 1);
var root_3 = $.from_html(`<a class="sp-post-meta__tag svelte-ah1ck6"> </a>`);
var root_4 = $.from_html(`<div class="sp-post-meta__tags svelte-ah1ck6"></div>`);
var root_5 = $.from_html(`<div class="sp-post-meta svelte-ah1ck6"><!> <!> <time class="sp-post-meta__date"> </time> <span class="sp-post-meta__sep svelte-ah1ck6">·</span> <span> </span> <!> <!></div>`);

export default function PostMeta($$anchor, $$props) {
	$.push($$props, true);

	const avatar = $.derived(() => blogConfig.author?.avatar);

	function href(to) {
		if ((/^(?:[a-z]+:)?\/\//i).test(to)) return to;

		return to.startsWith('/') ? `${base}${to}` : to;
	}

	var div = root_5();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => href($.get(avatar))]);
			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if ($.get(avatar)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_1();
			var span = $.first_child(fragment);
			var b = $.sibling($.child(span));
			var text = $.only_child(b, true);

			$.reset(span);
			$.next(2);
			$.template_effect(() => $.set_text(text, $$props.post.author));
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$props.post.author) $$render(consequent_1);
		});
	}

	var time = $.sibling(node_1, 2);
	var text_1 = $.only_child(time, true);
	var span_1 = $.sibling(time, 4);
	var text_2 = $.only_child(span_1);
	var node_2 = $.sibling(span_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var span_2 = $.sibling($.first_child(fragment_1), 2);
			var b_1 = $.sibling($.child(span_2));
			var text_3 = $.only_child(b_1, true);

			$.reset(span_2);
			$.template_effect(() => $.set_text(text_3, $$props.post.category));
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.post.category) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_4();

			$.each(div_1, 22, () => $$props.post.tags, (tag) => tag, ($$anchor, tag, i) => {
				var a = root_3();
				var text_4 = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `${base}/tags/${tag}/`);
					$.set_style(a, `view-transition-name: sp-tag-${$$props.post.slug ?? ''}-${$.get(i) ?? ''}`);
					$.set_text(text_4, tag);
				});

				$.append($$anchor, a);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_3, ($$render) => {
			if ($$props.post.tags.length) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_style(time, `view-transition-name: sp-date-${$$props.post.slug ?? ''}`);
		$.set_text(text_1, $$props.post.date);
		$.set_style(span_1, `view-transition-name: sp-reading-${$$props.post.slug ?? ''}`);
		$.set_text(text_2, `${$$props.post.readingTime ?? ''} min read`);
	});

	$.append($$anchor, div);
	$.pop();
}