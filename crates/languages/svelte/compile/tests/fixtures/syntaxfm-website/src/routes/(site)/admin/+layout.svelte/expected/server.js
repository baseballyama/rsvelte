import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		const LINKS = [
			{ name: 'Dashboard', link: '/admin' },
			{ name: 'Shows', link: '/admin/shows' },
			{ name: 'Transcripts', link: '/admin/transcripts' },
			{ name: 'Video', link: '/admin/videos' },
			{ name: 'Submissions', link: '/admin/submissions' },
			{ name: 'Cache', link: '/admin/cache' }
		];

		$$renderer.push(`<nav class="svelte-1k5m4xw"><!--[-->`);

		const each_array = $.ensure_array_like(LINKS);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', link.link)}${$.attr_class('svelte-1k5m4xw', void 0, {
				'active': $.store_get($$store_subs ??= {}, '$page', page).url.pathname === link.link
			})}>${$.escape(link.name)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <div class="admin svelte-1k5m4xw">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}