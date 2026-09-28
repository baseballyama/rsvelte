import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { PUBLIC_URL } from '$env/static/public';

var root = $.from_html(`<link rel="canonical"/>`);
var root_1 = $.from_html(`<meta property="og:url"/>`);
var root_2 = $.from_html(`<link rel="alternate" type="application/rss+xml" href="https://feed.syntax.fm" title="Syntax RSS Feed"/> <meta name="image" property="og:image"/> <meta name="theme-color" content="#000000"/> <!> <meta property="og:type" content="website"/> <meta property="og:title"/> <meta property="og:description"/> <!> <meta name="description"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"/> <meta name="twitter:site" content="@syntaxfm"/> <meta name="twitter:description"/> <meta name="twitter:image"/>`, 1);

export default function Meta($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let title = `Syntax - Web Development Podcast`;

	let meta = $.derived(() => ({
		//·defaults
		description: `Full Stack Web Developers Wes Bos and Scott Tolinski dive deep into web development, CSS, JavaScript, Frameworks, Typescript, Servers and more. Listen in 2 times a week!`,
		image: `${$page().url.protocol}//${$page().url.host}/og/${encodeURIComponent($page().data.meta?.title || title)}.jpg`,
		title,
		// any page customizations
		...$page().data.meta
	}));

	function generateTitle(title) {
		if (title.toLowerCase().includes('syntax')) return title;

		return `${title} - Syntax`;
	}

	$.head('6ijh7a', ($$anchor) => {
		var fragment = root_2();
		var meta_1 = $.sibling($.first_child(fragment), 2);
		var node = $.sibling(meta_1, 4);

		{
			var consequent = ($$anchor) => {
				var link = root();

				$.template_effect(() => $.set_attribute(link, 'href', $.get(meta).canonical));
				$.append($$anchor, link);
			};

			$.if(node, ($$render) => {
				if ($.get(meta).canonical) $$render(consequent);
			});
		}

		var meta_2 = $.sibling(node, 4);
		var meta_3 = $.sibling(meta_2, 2);
		var node_1 = $.sibling(meta_3, 2);

		{
			var consequent_1 = ($$anchor) => {
				var meta_4 = root_1();

				$.template_effect(() => $.set_attribute(meta_4, 'content', $.get(meta).canonical));
				$.append($$anchor, meta_4);
			};

			$.if(node_1, ($$render) => {
				if ($.get(meta).canonical) $$render(consequent_1);
			});
		}

		var meta_5 = $.sibling(node_1, 2);
		var meta_6 = $.sibling(meta_5, 4);
		var meta_7 = $.sibling(meta_6, 4);
		var meta_8 = $.sibling(meta_7, 2);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(meta_1, 'content', $.get(meta).image);
				$.set_attribute(meta_2, 'content', $0);
				$.set_attribute(meta_3, 'content', $.get(meta).description);
				$.set_attribute(meta_5, 'content', $.get(meta).description);
				$.set_attribute(meta_6, 'content', $1);
				$.set_attribute(meta_7, 'content', $.get(meta).description);
				$.set_attribute(meta_8, 'content', $.get(meta).image);
			},
			[
				() => generateTitle($.get(meta).title),
				() => generateTitle($.get(meta).title)
			]
		);

		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => generateTitle($.get(meta).title)]
		);

		$.append($$anchor, fragment);
	});

	$.pop();
	$$cleanup();
}