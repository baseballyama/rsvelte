import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { siteConfig } from "$lib/config.js";

var root = $.from_html(`<meta name="description"/> <meta name="keywords"/> <meta name="author" content="huntabyte"/> <meta name="creator" content="huntabyte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/> <meta name="twitter:image:alt"/> <meta name="twitter:creator" content="@huntabyte"/> <meta property="og:title"/> <meta property="og:type"/> <meta property="og:url"/> <meta property="og:image"/> <meta property="og:image:alt"/> <meta property="og:image:width"/> <meta property="og:image:height"/> <meta property="og:description"/> <meta property="og:site_name"/> <meta property="og:locale" content="EN_US"/>`, 1);

export default function Metadata($$anchor, $$props) {
	$.push($$props, true);

	let keywords = $.prop($$props, 'keywords', 19, () => siteConfig.keywords),
		ogType = $.prop($$props, 'ogType', 3, "website");

	const ogUrl = $.derived(() => {
		if (!$$props.ogImage?.url) return siteConfig.ogImage.url;
		if ($$props.ogImage.url.startsWith("/")) return siteConfig.url + $$props.ogImage.url;

		return $$props.ogImage.url;
	});

	const ogWidth = $.derived(() => {
		if ($$props.ogImage?.width) return $$props.ogImage.width;

		return siteConfig.ogImage.width;
	});

	const ogHeight = $.derived(() => {
		if ($$props.ogImage?.height) return $$props.ogImage.height;

		return siteConfig.ogImage.height;
	});

	const trueTitle = $.derived(() => $$props.title === siteConfig.name
		? siteConfig.name
		: `${$$props.title} - ${siteConfig.name}`);

	$.head('5v2rt', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 8);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 4);
		var meta_8 = $.sibling(meta_7, 2);
		var meta_9 = $.sibling(meta_8, 2);
		var meta_10 = $.sibling(meta_9, 2);
		var meta_11 = $.sibling(meta_10, 2);
		var meta_12 = $.sibling(meta_11, 2);
		var meta_13 = $.sibling(meta_12, 2);
		var meta_14 = $.sibling(meta_13, 2);
		var meta_15 = $.sibling(meta_14, 2);

		$.next(2);

		$.template_effect(
			($0) => {
				$.set_attribute(meta, 'content', $$props.description);
				$.set_attribute(meta_1, 'content', $0);
				$.set_attribute(meta_2, 'content', siteConfig.url);
				$.set_attribute(meta_3, 'content', $$props.title);
				$.set_attribute(meta_4, 'content', $$props.description);
				$.set_attribute(meta_5, 'content', $.get(ogUrl));
				$.set_attribute(meta_6, 'content', $$props.title);
				$.set_attribute(meta_7, 'content', $$props.title);
				$.set_attribute(meta_8, 'content', ogType());
				$.set_attribute(meta_9, 'content', siteConfig.url + page.url.pathname);
				$.set_attribute(meta_10, 'content', $.get(ogUrl));
				$.set_attribute(meta_11, 'content', $$props.title);
				$.set_attribute(meta_12, 'content', $.get(ogWidth));
				$.set_attribute(meta_13, 'content', $.get(ogHeight));
				$.set_attribute(meta_14, 'content', $$props.description);
				$.set_attribute(meta_15, 'content', siteConfig.name);
			},
			[() => keywords()?.join(",")]
		);

		$.deferred_template_effect(() => {
			$.document.title = $.get(trueTitle) ?? '';
		});

		$.append($$anchor, fragment);
	});

	$.pop();
}