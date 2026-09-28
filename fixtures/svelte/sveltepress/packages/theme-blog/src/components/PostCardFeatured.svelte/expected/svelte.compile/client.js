import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<span class="sp-card-featured__tag svelte-obae1p"> </span>`);
var root_1 = $.from_html(`<div class="sp-card-featured__tags svelte-obae1p"></div>`);
var root_2 = $.from_html(`<article class="sp-card-featured svelte-obae1p"><a class="sp-card-featured__link svelte-obae1p"><div class="sp-card-featured__bg svelte-obae1p"><div class="sp-card-featured__overlay svelte-obae1p"><!> <h2 class="sp-card-featured__title svelte-obae1p"> </h2> <p class="sp-card-featured__excerpt svelte-obae1p"> </p> <div class="sp-card__meta sp-card__meta--light svelte-obae1p"><time> </time> <span> </span></div></div></div></a></article>`);

export default function PostCardFeatured($$anchor, $$props) {
	$.push($$props, true);

	const coverSrc = $.derived(() => $$props.post.cover && $$props.post.cover.startsWith('/') && !$$props.post.cover.startsWith('//') ? `${base}${$$props.post.cover}` : $$props.post.cover);
	var article = root_2();
	var a = $.child(article);
	var div = $.child(a);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();

			$.each(div_2, 22, () => $$props.post.tags, (tag) => tag, ($$anchor, tag, i) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => {
					$.set_style(span, `view-transition-name: sp-tag-${$$props.post.slug ?? ''}-${$.get(i) ?? ''}`);
					$.set_text(text, tag);
				});

				$.append($$anchor, span);
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.post.tags.length) $$render(consequent);
		});
	}

	var h2 = $.sibling(node, 2);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_2 = $.only_child(p, true);
	var div_3 = $.sibling(p, 2);
	var time = $.child(div_3);
	var text_3 = $.only_child(time, true);
	var span_1 = $.sibling(time, 2);
	var text_4 = $.only_child(span_1);

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(a);
	$.reset(article);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base}/posts/${$$props.post.slug}/`);

		$.set_style(div, `${$.get(coverSrc)
			? `background-image:url(${$.get(coverSrc)})`
			: 'background:linear-gradient(135deg,#ea580c 0%,#dc2626 50%,#9a3412 100%)'}; view-transition-name: sp-cover-${$$props.post.slug}`);

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