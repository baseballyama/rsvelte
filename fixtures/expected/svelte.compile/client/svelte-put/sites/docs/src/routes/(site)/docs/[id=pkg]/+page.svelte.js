import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Runes } from '$lib/components/runes';

import {
	createBundlephobiaBadgeUrl,
	createBundlephobiaUrl,
	createChangelogBadgeUrl,
	createNpmBadgeUrl,
	createNpmDownloadBadgeUrl,
	createNpmUrl,
	createSvelteReplBadgeUrl,
	createSvelteReplUrl
} from '$lib/utils/badge';

var root = $.from_html(`<a data-external="" class="h-full"><img loading="lazy" decoding="async" class="my-0 inline-block h-6 w-auto rounded"/></a>`);
var root_1 = $.from_html(`<p class="c-callout c-callout--info c-callout--icon-bulb"> </p>`);
var root_2 = $.from_html(`<div class="mb-8 flex items-center justify-between border-b"><h1 class="font-fingerpaint border-b-0 svelte-s5geyt"> </h1> <a class="c-link-icon not-prose" data-external=""><svg inline-src="simpleicon/github" class="inline" height="28" width="28"></svg> <span class="sr-only">Github</span></a></div> <!> <!> <p class="not-prose flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!></p> <p class="c-callout c-callout--success c-callout--icon-megaphone max-w-md xl:hidden">Still on Svelte 4? See <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old docs site here.</a></p> <!> <p class="text-right text-sm"><a class="c-link">Edit this page on Github</a></p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const badge = (
		$$anchor,
		href = $.noop,
		src = $.noop,
		width = $.noop,
		height = $.noop
	) => {
		var a = root();
		var img = $.only_child(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', href());
			$.set_attribute(img, 'alt', $.get(name));
			$.set_attribute(img, 'src', src());
			$.set_attribute(img, 'width', width());
			$.set_attribute(img, 'height', height());
		});

		$.append($$anchor, a);
	};

	const name = $.derived(() => `@svelte-put/${$$props.data.package.id}`);
	const githubSourceUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/edit/main/sites/docs/src/packages/${$$props.data.package.id}/docs.md.svelte`);
	const changelogUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/tree/main/packages/${$$props.data.package.id}/CHANGELOG.md`);
	const githubUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/tree/main/packages/${$$props.data.package.id}`);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var h1 = $.child(div);
	var text = $.only_child(h1, true);
	var a_1 = $.sibling(h1, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $$props.data.package.description));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.data.package.description) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Runes($$anchor, { class: 'float-right' });
		};

		$.if(node_1, ($$render) => {
			if ($$props.data.package.rune) $$render(consequent_1);
		});
	}

	var p_1 = $.sibling(node_1, 2);
	var node_2 = $.child(p_1);

	{
		let $0 = $.derived(() => createNpmUrl($.get(name)));
		let $1 = $.derived(() => createNpmBadgeUrl($.get(name), $$props.data.package.releaseTag));

		badge(node_2, () => $.get($0), () => $.get($1), () => 24, () => 107);
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => createNpmUrl($.get(name)));
		let $1 = $.derived(() => createNpmDownloadBadgeUrl($.get(name)));

		badge(node_3, () => $.get($0), () => $.get($1), () => 24, () => 134);
	}

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => createBundlephobiaUrl($.get(name)));
		let $1 = $.derived(() => createBundlephobiaBadgeUrl($.get(name)));

		badge(node_4, () => $.get($0), () => $.get($1), () => 24, () => 125);
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => createSvelteReplUrl($$props.data.package.replId));
				let $1 = $.derived(createSvelteReplBadgeUrl);

				badge($$anchor, () => $.get($0), () => $.get($1), () => 24, () => 112);
			}
		};

		$.if(node_5, ($$render) => {
			if ($$props.data.package.replId) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(createChangelogBadgeUrl);

		badge(node_6, () => $.get(changelogUrl), () => $.get($0), () => 24, () => 90);
	}

	$.reset(p_1);

	var node_7 = $.sibling(p_1, 4);

	{
		var consequent_3 = ($$anchor) => {
			const Content = $.derived(() => $$props.data.Content);
			var fragment_3 = $.comment();
			var node_8 = $.first_child(fragment_3);

			$.component(node_8, () => $.get(Content), ($$anchor, Content_1) => {
				Content_1($$anchor, {});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_7, ($$render) => {
			if ($$props.data.Content) $$render(consequent_3);
		});
	}

	var p_2 = $.sibling(node_7, 2);
	var a_2 = $.only_child(p_2);

	$.template_effect(() => {
		$.set_text(text, $.get(name));
		$.set_attribute(a_1, 'href', $.get(githubUrl));
		$.set_attribute(a_2, 'href', $.get(githubSourceUrl));
	});

	$.append($$anchor, fragment);
	$.pop();
}