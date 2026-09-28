import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { PUBLIC_MODE } from '$env/static/public';
import ogImageHome from '$lib/assets/images/svelte-put-og.jpg?url';
import { SettingsContext } from '$lib/settings/context.svelte';
import '$lib/styles/app.css';

var root = $.from_html(`<meta name="description"/> <meta name="keywords"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:type"/> <meta property="og:image"/> <meta property="og:image:alt"/> <meta property="og:url"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:card"/> <meta name="twitter:image"/> <meta name="twitter:image:alt"/> <meta name="twitter:site"/> <meta name="twitter:creator"/> <link rel="canonical"/> <link type="text/plain" rel="author"/> <meta name="mode"/>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const DEFAULT_KEYWORDS = ['svelte', 'svelte-put', 'utility'];

	let meta = $.derived(() => {
		const meta = $page().data.meta;
		const title = meta?.title ?? 'svelte-put';
		const description = meta?.description ?? 'svelte-put is a collection of utilities, minimal components, and tooling support for projects using Svelte';

		const keywords = meta?.keywords
			? [...DEFAULT_KEYWORDS, ...meta.keywords]
			: DEFAULT_KEYWORDS;

		const canonical = meta?.canonical ?? `${$page().url.origin}${$page().url.pathname}`;
		const rootRelativeOgImage = meta?.og?.image ?? ogImageHome;

		const og = {
			title: meta?.og?.title ?? title,
			description: meta?.og?.description ?? description,
			type: meta?.og?.type ?? 'website',
			url: meta?.og?.url ?? canonical,
			image: rootRelativeOgImage.startsWith('/')
				? `${$page().url.origin}${rootRelativeOgImage}`
				: rootRelativeOgImage,
			imageAlt: meta?.og?.imageAlt ?? title
		};

		const twitter = {
			title: meta?.twitter?.title ?? og.title,
			description: meta?.twitter?.description ?? og.description,
			image: meta?.twitter?.image ?? og.image,
			imageAlt: meta?.twitter?.imageAlt ?? og.imageAlt,
			card: meta?.twitter?.card ?? 'summary_large_image',
			site: meta?.twitter?.site ?? '@vnphanquang',
			creator: meta?.twitter?.creator ?? '@vnphanquang'
		};

		return { title, description, keywords, canonical, og, twitter };
	});

	let settings = SettingsContext.set($$props.data.settings);

	$.user_effect(() => {
		settings.colorScheme = $$props.data.settings.colorScheme;
		settings.packageManager = $$props.data.settings.packageManager;
	});

	var fragment_1 = $.comment();

	$.head('12evr8a', ($$anchor) => {
		var fragment = root();
		var meta_1 = $.first_child(fragment);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 2);
		var meta_8 = $.sibling(meta_7, 2);
		var meta_9 = $.sibling(meta_8, 2);
		var meta_10 = $.sibling(meta_9, 2);
		var meta_11 = $.sibling(meta_10, 2);
		var meta_12 = $.sibling(meta_11, 2);
		var meta_13 = $.sibling(meta_12, 2);
		var meta_14 = $.sibling(meta_13, 2);
		var meta_15 = $.sibling(meta_14, 2);
		var link = $.sibling(meta_15, 2);
		var link_1 = $.sibling(link, 2);
		var meta_16 = $.sibling(link_1, 2);

		$.template_effect(
			($0) => {
				$.set_attribute(meta_1, 'content', $.get(meta).description);
				$.set_attribute(meta_2, 'content', $0);
				$.set_attribute(meta_3, 'content', $.get(meta).og.title);
				$.set_attribute(meta_4, 'content', $.get(meta).og.description);
				$.set_attribute(meta_5, 'content', $.get(meta).og.type);
				$.set_attribute(meta_6, 'content', $.get(meta).og.image);
				$.set_attribute(meta_7, 'content', $.get(meta).og.imageAlt);
				$.set_attribute(meta_8, 'content', $.get(meta).og.url);
				$.set_attribute(meta_9, 'content', $.get(meta).twitter.title);
				$.set_attribute(meta_10, 'content', $.get(meta).twitter.description);
				$.set_attribute(meta_11, 'content', $.get(meta).twitter.card);
				$.set_attribute(meta_12, 'content', $.get(meta).twitter.image);
				$.set_attribute(meta_13, 'content', $.get(meta).twitter.imageAlt);
				$.set_attribute(meta_14, 'content', $.get(meta).twitter.site);
				$.set_attribute(meta_15, 'content', $.get(meta).twitter.creator);
				$.set_attribute(link, 'href', $.get(meta).canonical);
				$.set_attribute(link_1, 'href', `${$page().url.origin ?? ''}/humans.txt`);
				$.set_attribute(meta_16, 'content', PUBLIC_MODE);
			},
			[() => $.get(meta).keywords.join(', ')]
		);

		$.deferred_template_effect(() => {
			$.document.title = $.get(meta).title ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}