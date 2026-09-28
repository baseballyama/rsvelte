import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const name = $.derived(() => `@svelte-put/${data.package.id}`);
		const githubSourceUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/edit/main/sites/docs/src/packages/${data.package.id}/docs.md.svelte`);
		const changelogUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/tree/main/packages/${data.package.id}/CHANGELOG.md`);
		const githubUrl = $.derived(() => `https://github.com/vnphanquang/svelte-put/tree/main/packages/${data.package.id}`);

		function badge($$renderer, href, src, width, height) {
			$$renderer.push(`<a${$.attr('href', href)} data-external="" class="h-full"><img loading="lazy" decoding="async" class="my-0 inline-block h-6 w-auto rounded"${$.attr('alt', name())}${$.attr('src', src)}${$.attr('width', width)}${$.attr('height', height)}/></a>`);
		}

		$$renderer.push(`<div class="mb-8 flex items-center justify-between border-b"><h1 class="font-fingerpaint border-b-0 svelte-s5geyt">${$.escape(name())}</h1> <a${$.attr('href', githubUrl())} class="c-link-icon not-prose" data-external=""><svg inline-src="simpleicon/github" class="inline" height="28" width="28"></svg> <span class="sr-only">Github</span></a></div> `);

		if (data.package.description) {
			$$renderer.push(`<!--[0--><p class="c-callout c-callout--info c-callout--icon-bulb">${$.escape(data.package.description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (data.package.rune) {
			$$renderer.push('<!--[0-->');
			Runes($$renderer, { class: 'float-right' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <p class="not-prose flex flex-wrap items-center gap-2">`);
		badge($$renderer, createNpmUrl(name()), createNpmBadgeUrl(name(), data.package.releaseTag), 24, 107);
		$$renderer.push(`<!----> `);
		badge($$renderer, createNpmUrl(name()), createNpmDownloadBadgeUrl(name()), 24, 134);
		$$renderer.push(`<!----> `);
		badge($$renderer, createBundlephobiaUrl(name()), createBundlephobiaBadgeUrl(name()), 24, 125);
		$$renderer.push(`<!----> `);

		if (data.package.replId) {
			$$renderer.push('<!--[0-->');
			badge($$renderer, createSvelteReplUrl(data.package.replId), createSvelteReplBadgeUrl(), 24, 112);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		badge($$renderer, changelogUrl(), createChangelogBadgeUrl(), 24, 90);
		$$renderer.push(`<!----></p> <p class="c-callout c-callout--success c-callout--icon-megaphone max-w-md xl:hidden">Still on Svelte 4? See <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old docs site here.</a></p> `);

		if (data.Content) {
			$$renderer.push('<!--[0-->');

			const Content = data.Content;

			if (Content) {
				$$renderer.push('<!--[-->');
				Content($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <p class="text-right text-sm"><a class="c-link"${$.attr('href', githubSourceUrl())}>Edit this page on Github</a></p>`);
	});
}