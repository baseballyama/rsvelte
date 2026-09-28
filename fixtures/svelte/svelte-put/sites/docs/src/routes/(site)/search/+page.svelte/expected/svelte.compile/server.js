import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let pagefind = null;
		let sanitize = null;
		let query = data.query;

		let promise = $.derived(() => {
			if (!pagefind || !data.query) return new Promise(() => {});

			return pagefind.debouncedSearch(data.query, undefined, 500);
		});

		onMount(async () => {
			pagefind = await import('@pagefind');
			sanitize = (await import('sanitize-html')).default;
			pagefind.init();
		});

		function submit(e) {
			e.preventDefault();

			const url = new URL($.store_get($$store_subs ??= {}, '$page', page).url);

			url.searchParams.set('q', query);
			goto(url, { replaceState: true });
		}

		function transformLink(url) {
			return url.replace('.html', '');
		}

		$$renderer.push(`<div class="not-prose contents"><h1 class="text-4xl">Search</h1> <form class="mt-8" method="GET"><div class="flex gap-2"><label class="c-text-input flex-1"><i class="i i-[magnifying-glass] h-6 w-6 shrink-0"></i> <input type="text" name="q" id="q"${$.attr('value', query)} placeholder="search something..."/></label> <button class="c-btn c-btn--outlined" type="submit">Search</button></div> <label class="text-fg-200 mt-1 block text-sm" for="q">Type and press enter or hit "search" button</label></form> `);

		$.await($$renderer, promise(), () => {}, (searched) => {
			if (searched) {
				$$renderer.push(`<!--[0--><ul class="divide-outline divide-y"><!--[-->`);

				const each_array = $.ensure_array_like(searched.results);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let { data } = each_array[$$index_1];

					$$renderer.push(`<li>`);

					$.await(
						$$renderer,
						data(),
						() => {
							$$renderer.push(`<div class="c-loader mx-auto"></div>`);
						},
						({ meta, url, sub_results }) => {
							$$renderer.push(`<article class="space-y-4 py-4"><p class="font-fingerpaint text-lg"><a class="c-link"${$.attr('href', transformLink(url))}>${$.escape(meta.title)}</a></p> `);

							if (sub_results?.length) {
								$$renderer.push(`<!--[0--><ul class="space-y-2 px-4"><!--[-->`);

								const each_array_1 = $.ensure_array_like(sub_results.slice(0, 5));

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let { title, url, excerpt } = each_array_1[$$index];

									$$renderer.push(`<li><p><a class="c-link"${$.attr('href', transformLink(url))}>${$.escape(title)}</a></p> `);

									if (sanitize) {
										$$renderer.push(`<!--[0--><p>...${$.html(sanitize(excerpt))}...</p>`);
									} else {
										$$renderer.push(`<!--[-1--><p>...${$.escape(excerpt)}...</p>`);
									}

									$$renderer.push(`<!--]--></li>`);
								}

								$$renderer.push(`<!--]--></ul>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></article>`);
						}
					);

					$$renderer.push(`<!--]--></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}