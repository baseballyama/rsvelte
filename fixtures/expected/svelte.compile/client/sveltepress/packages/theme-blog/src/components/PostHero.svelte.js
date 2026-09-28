import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<span class="sp-post-hero__cat svelte-be2e0x"> </span>`);
var root_1 = $.from_html(`<header class="sp-post-hero svelte-be2e0x"><div class="sp-post-hero__overlay svelte-be2e0x"><!> <h1 class="sp-post-hero__title svelte-be2e0x"> </h1> <p class="sp-post-hero__subtitle svelte-be2e0x"> </p></div></header>`);

export default function PostHero($$anchor, $$props) {
	$.push($$props, true);

	const coverSrc = $.derived(() => $$props.post.cover && $$props.post.cover.startsWith('/') && !$$props.post.cover.startsWith('//') ? `${base}${$$props.post.cover}` : $$props.post.cover);
	var header = root_1();
	var div = $.child(header);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.post.category));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.post.category) $$render(consequent);
		});
	}

	var h1 = $.sibling(node, 2);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(div);
	$.reset(header);

	$.template_effect(() => {
		$.set_style(header, `${$.get(coverSrc) ? `--hero-bg: url(${$.get(coverSrc)});` : ''} view-transition-name: sp-cover-${$$props.post.slug}`);
		$.set_style(h1, `view-transition-name: sp-title-${$$props.post.slug ?? ''}`);
		$.set_text(text_1, $$props.post.title);
		$.set_style(p, `view-transition-name: sp-excerpt-${$$props.post.slug ?? ''}`);
		$.set_text(text_2, $$props.post.excerpt);
	});

	$.append($$anchor, header);
	$.pop();
}