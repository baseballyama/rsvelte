import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { useSiteConfig } from "$lib/utils/use-site-config.svelte.js";

var root = $.from_html(`<meta name="description"/> <meta name="keywords"/> <meta name="author" content="huntabyte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/> <meta name="twitter:image:alt"/> <meta name="twitter:creator" content="huntabyte"/> <meta property="og:title"/> <meta property="og:type" content="website"/> <meta property="og:url"/> <meta property="og:image"/> <meta property="og:image:alt"/> <meta property="og:image:width"/> <meta property="og:image:height"/> <meta property="og:description"/> <meta property="og:site_name"/> <meta property="og:locale" content="EN_US"/>`, 1);

export default function Metadata($$anchor, $$props) {
	$.push($$props, true);

	const siteConfig = useSiteConfig();

	let title = $.prop($$props, 'title', 19, () => siteConfig.current.name),
		ogImage = $.prop($$props, 'ogImage', 19, () => siteConfig.current.ogImage),
		description = $.prop($$props, 'description', 19, () => siteConfig.current.description),
		keywords = $.prop($$props, 'keywords', 19, () => siteConfig.current.keywords);

	const trueTitle = $.derived(() => title() === siteConfig.current.name
		? siteConfig.current.name
		: `${title()} - ${siteConfig.current.name}`);

	$.head('5v2rt', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 6);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 4);
		var meta_8 = $.sibling(meta_7, 4);
		var meta_9 = $.sibling(meta_8, 2);
		var meta_10 = $.sibling(meta_9, 2);
		var meta_11 = $.sibling(meta_10, 2);
		var meta_12 = $.sibling(meta_11, 2);
		var meta_13 = $.sibling(meta_12, 2);
		var meta_14 = $.sibling(meta_13, 2);

		$.next(2);

		$.template_effect(
			($0) => {
				$.set_attribute(meta, 'content', description());
				$.set_attribute(meta_1, 'content', $0);
				$.set_attribute(meta_2, 'content', siteConfig.current.url);
				$.set_attribute(meta_3, 'content', title());
				$.set_attribute(meta_4, 'content', description());
				$.set_attribute(meta_5, 'content', ogImage()?.url);
				$.set_attribute(meta_6, 'content', title());
				$.set_attribute(meta_7, 'content', title());
				$.set_attribute(meta_8, 'content', siteConfig.current.url + page.url.pathname);
				$.set_attribute(meta_9, 'content', ogImage()?.url);
				$.set_attribute(meta_10, 'content', title());
				$.set_attribute(meta_11, 'content', ogImage()?.width);
				$.set_attribute(meta_12, 'content', ogImage()?.height);
				$.set_attribute(meta_13, 'content', description());
				$.set_attribute(meta_14, 'content', siteConfig.current.name);
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