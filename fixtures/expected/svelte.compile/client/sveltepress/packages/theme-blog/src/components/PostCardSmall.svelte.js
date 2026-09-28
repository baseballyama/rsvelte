import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<span class="sp-card__tag svelte-69hb18"> </span>`);
var root_1 = $.from_html(`<div class="sp-card__tags svelte-69hb18"></div>`);
var root_2 = $.from_html(`<article class="sp-card-small svelte-69hb18"><a class="sp-card-small__link svelte-69hb18"><!> <h2 class="sp-card-small__title svelte-69hb18"> </h2> <p class="sp-card-small__quote svelte-69hb18"> </p> <div class="sp-card__meta svelte-69hb18"><time> </time> <span> </span></div></a></article>`);

export default function PostCardSmall($$anchor, $$props) {
	$.push($$props, true);

	var article = root_2();
	var a = $.child(article);
	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 22, () => $$props.post.tags, (tag) => tag, ($$anchor, tag, i) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => {
					$.set_style(span, `view-transition-name: sp-tag-${$$props.post.slug ?? ''}-${$.get(i) ?? ''}`);
					$.set_text(text, tag);
				});

				$.append($$anchor, span);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.post.tags.length) $$render(consequent);
		});
	}

	var h2 = $.sibling(node, 2);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_2 = $.only_child(p, true);
	var div_1 = $.sibling(p, 2);
	var time = $.child(div_1);
	var text_3 = $.only_child(time, true);
	var span_1 = $.sibling(time, 2);
	var text_4 = $.only_child(span_1);

	$.reset(div_1);
	$.reset(a);
	$.reset(article);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base}/posts/${$$props.post.slug}/`);
		$.set_style(h2, `view-transition-name: sp-title-${$$props.post.slug ?? ''}`);
		$.set_text(text_1, $$props.post.title);
		$.set_style(p, `view-transition-name: sp-excerpt-${$$props.post.slug ?? ''}`);
		$.set_text(text_2, $$props.post.excerpt);
		$.set_style(time, `view-transition-name: sp-date-${$$props.post.slug ?? ''}`);
		$.set_text(text_3, $$props.post.date);
		$.set_style(span_1, `view-transition-name: sp-reading-${$$props.post.slug ?? ''}`);
		$.set_text(text_4, `${$$props.post.readingTime ?? ''} min read`);
	});

	$.append($$anchor, article);
	$.pop();
}