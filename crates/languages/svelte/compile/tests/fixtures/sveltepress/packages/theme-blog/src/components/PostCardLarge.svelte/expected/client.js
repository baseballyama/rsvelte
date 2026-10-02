import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<img class="sp-card-large__cover svelte-1ujso14" width="800" height="400" loading="lazy" decoding="async"/>`);
var root_1 = $.from_html(`<div class="sp-card-large__cover sp-card-large__cover--gradient svelte-1ujso14"></div>`);
var root_2 = $.from_html(`<span class="sp-card__tag svelte-1ujso14"> </span>`);
var root_3 = $.from_html(`<div class="sp-card__tags svelte-1ujso14"></div>`);
var root_4 = $.from_html(`<article class="sp-card-large svelte-1ujso14"><a class="sp-card-large__link svelte-1ujso14"><div class="sp-card-large__cover-frame svelte-1ujso14"><!></div> <div class="sp-card-large__body svelte-1ujso14"><!> <h2 class="sp-card-large__title svelte-1ujso14"> </h2> <p class="sp-card-large__excerpt svelte-1ujso14"> </p> <div class="sp-card__meta svelte-1ujso14"><time> </time> <span> </span></div></div></a></article>`);

export default function PostCardLarge($$anchor, $$props) {
	$.push($$props, true);

	// Base-prefix site-absolute cover paths so they resolve under a subpath
	// deploy. External URLs pass through unchanged.
	const coverSrc = $.derived(() => $$props.post.cover && $$props.post.cover.startsWith('/') && !$$props.post.cover.startsWith('//') ? `${base}${$$props.post.cover}` : $$props.post.cover);

	// Hash tag name to one of the Ember gradients for cover fallback
	const GRADIENTS = [
		'linear-gradient(135deg,#ea580c,#dc2626)',
		'linear-gradient(135deg,#f59e0b,#ea580c)',
		'linear-gradient(135deg,#c2410c,#9a3412)',
		'linear-gradient(135deg,#b45309,#d97706)',
		'linear-gradient(135deg,#dc2626,#7c2d12)'
	];

	function tagGradient(tag) {
		let hash = 0;

		for (const ch of tag) hash = hash * 31 + ch.charCodeAt(0) >>> 0;

		return GRADIENTS[hash % GRADIENTS.length];
	}

	const gradient = $.derived(() => $$props.post.tags[0] ? tagGradient($$props.post.tags[0]) : GRADIENTS[0]);
	var article = root_4();
	var a = $.child(article);
	var div = $.child(a);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(coverSrc));
				$.set_attribute(img, 'alt', $$props.post.title);
			});

			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();

			$.template_effect(() => $.set_style(div_1, `background:${$.get(gradient) ?? ''}`));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.post.cover) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_1 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_3();

			$.each(div_3, 22, () => $$props.post.tags, (tag) => tag, ($$anchor, tag, i) => {
				var span = root_2();
				var text = $.only_child(span, true);

				$.template_effect(() => {
					$.set_style(span, `view-transition-name: sp-tag-${$$props.post.slug ?? ''}-${$.get(i) ?? ''}`);
					$.set_text(text, tag);
				});

				$.append($$anchor, span);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($$props.post.tags.length) $$render(consequent_1);
		});
	}

	var h2 = $.sibling(node_1, 2);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_2 = $.only_child(p, true);
	var div_4 = $.sibling(p, 2);
	var time = $.child(div_4);
	var text_3 = $.only_child(time, true);
	var span_1 = $.sibling(time, 2);
	var text_4 = $.only_child(span_1);

	$.reset(div_4);
	$.reset(div_2);
	$.reset(a);
	$.reset(article);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base}/posts/${$$props.post.slug}/`);
		$.set_style(div, `view-transition-name: sp-cover-${$$props.post.slug ?? ''}`);
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