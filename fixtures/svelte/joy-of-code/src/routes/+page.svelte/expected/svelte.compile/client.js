import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Newsletter from '$lib/ui/newsletter.svelte';
import Posts from '$lib/ui/posts.svelte';
import { ArrowRight } from '$lib/icons';
import * as config from '$lib/site/config';

var root = $.from_html(`<meta name="description"/> <meta property="og:title"/> <meta property="og:image"/> <meta property="og:url"/> <meta property="og:description"/> <meta property="og:site_name"/> <meta name="twitter:creator"/> <meta content="summary_large_image" name="twitter:card"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/>`, 1);
var root_1 = $.from_html(`<h3 class="latest svelte-1uha8ag">Latest</h3>`);
var root_2 = $.from_html(`<a href="/archive"><span>See more posts</span> <!></a>`);
var root_3 = $.from_html(`<main><section class="hero svelte-1uha8ag"><div class="latest-post svelte-1uha8ag"><h1 class="title svelte-1uha8ag"> </h1> <p class="description svelte-1uha8ag"> </p> <a class="continue-reading svelte-1uha8ag"><span>Continue reading</span> <!></a></div> <div class="divider svelte-1uha8ag"></div> <div class="newsletter svelte-1uha8ag"><h2 class="svelte-1uha8ag">Subscribe for updates</h2> <!></div></section> <!></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const posts = $.derived(() => $$props.data.posts);
	var main = root_3();

	$.head('1uha8ag', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 4);
		var meta_8 = $.sibling(meta_7, 2);
		var meta_9 = $.sibling(meta_8, 2);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', config.siteDescription);
			$.set_attribute(meta_1, 'content', config.siteTitle);
			$.set_attribute(meta_2, 'content', config.siteImage);
			$.set_attribute(meta_3, 'content', config.siteUrl);
			$.set_attribute(meta_4, 'content', config.siteDescription);
			$.set_attribute(meta_5, 'content', config.siteName);
			$.set_attribute(meta_6, 'content', config.twitterHandle);
			$.set_attribute(meta_7, 'content', config.siteTitle);
			$.set_attribute(meta_8, 'content', config.siteDescription);
			$.set_attribute(meta_9, 'content', config.siteImage);
		});

		$.deferred_template_effect(() => {
			$.document.title = config.siteTitle ?? '';
		});

		$.append($$anchor, fragment);
	});

	var section = $.child(main);
	var div = $.child(section);
	var h1 = $.child(div);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);
	var a = $.sibling(p, 2);
	var node = $.sibling($.child(a), 2);

	ArrowRight(node, { width: 24, height: 24, 'aria-hidden': true });
	$.reset(a);
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_1 = $.sibling($.child(div_1), 2);

	Newsletter(node_1, {});
	$.reset(div_1);
	$.reset(section);

	var node_2 = $.sibling(section, 2);

	{
		const title = ($$anchor) => {
			var h3 = root_1();

			$.append($$anchor, h3);
		};

		const more = ($$anchor) => {
			var a_1 = root_2();
			var node_3 = $.sibling($.child(a_1), 2);

			ArrowRight(node_3, { width: '24', height: '24', 'aria-hidden': 'true' });
			$.reset(a_1);
			$.append($$anchor, a_1);
		};

		Posts(node_2, {
			get posts() {
				return $.get(posts);
			},
			title,
			more,
			$$slots: { title: true, more: true }
		});
	}

	$.reset(main);

	$.template_effect(() => {
		$.set_text(text, $.get(posts)[0].title);
		$.set_text(text_1, $.get(posts)[0].description);
		$.set_attribute(a, 'href', $.get(posts)[0].slug);
	});

	$.append($$anchor, main);
	$.pop();
}