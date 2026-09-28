import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { title, links = [], search, toggle } = $$props;
		const author = $.derived(() => blogConfig.author);
		const about = $.derived(() => blogConfig.about);

		// User-configured nav links and asset paths use site-relative paths like
		// "/avatar.png" or "/timeline/"; prepend SvelteKit's `base` so they resolve
		// under a subpath deploy. Leaves protocol-qualified URLs alone.
		function href(to) {
			if ((/^(?:[a-z]+:)?\/\//i).test(to)) return to;

			return to.startsWith('/') ? `${base}${to}` : to;
		}

		const socialDefs = [
			{
				key: 'github',
				label: 'GitHub',
				href: (v) => `https://github.com/${v}`
			},

			{
				key: 'twitter',
				label: 'Twitter/X',
				href: (v) => `https://x.com/${v}`
			},
			{ key: 'mastodon', label: 'Mastodon', href: (v) => v },
			{
				key: 'bluesky',
				label: 'Bluesky',
				href: (v) => `https://bsky.app/profile/${v}`
			},
			{ key: 'email', label: 'Email', href: (v) => `mailto:${v}` },
			{ key: 'website', label: 'Website', href: (v) => v },
			{ key: 'rss', label: 'RSS', href: (v) => v }
		];

		const socials = $.derived(() => {
			const s = author()?.socials;
			const out = [];

			if (s) {
				for (const d of socialDefs) {
					const v = s[d.key];

					if (v) out.push({ label: d.label, href: href(d.href(v)) });
				}
			}

			return out;
		});

		function openSearch() {
			dispatchEvent(new CustomEvent('sp-search-open'));
		}

		$$renderer.push(`<aside class="sp-sidebar svelte-1lk6cpv"><a${$.attr('href', `${$.stringify(base)}/`)} class="sp-sidebar__brand svelte-1lk6cpv">${$.escape(title)}</a> `);

		if (author()) {
			$$renderer.push(`<!--[0--><section class="sp-sidebar__profile svelte-1lk6cpv">`);

			if (author().avatar) {
				$$renderer.push(`<!--[0--><img class="sp-sidebar__avatar svelte-1lk6cpv"${$.attr('src', href(author().avatar))} alt="" width="80" height="80"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="sp-sidebar__name svelte-1lk6cpv">${$.escape(author().name)}</div> `);

			if (author().bio) {
				$$renderer.push(`<!--[0--><p class="sp-sidebar__bio svelte-1lk6cpv">${$.escape(author().bio)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (socials().length) {
				$$renderer.push(`<!--[0--><ul class="sp-sidebar__socials svelte-1lk6cpv"><!--[-->`);

				const each_array = $.ensure_array_like(socials());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					$$renderer.push(`<li><a${$.attr('href', s.href)} rel="me" class="svelte-1lk6cpv">${$.escape(s.label)}</a></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (about()?.html) {
				$$renderer.push(`<!--[0--><div class="sp-sidebar__about svelte-1lk6cpv">${$.html(about().html)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (links.length) {
			$$renderer.push(`<!--[0--><nav class="sp-sidebar__nav svelte-1lk6cpv" aria-label="Primary"><!--[-->`);

			const each_array_1 = $.ensure_array_like(links);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let link = each_array_1[$$index_1];

				$$renderer.push(`<a${$.attr('href', href(link.to))} class="svelte-1lk6cpv">${$.escape(link.title)}</a>`);
			}

			$$renderer.push(`<!--]--></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="sp-sidebar__actions svelte-1lk6cpv">`);

		if (search) {
			$$renderer.push('<!--[0-->');
			search($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button type="button" class="sp-sidebar__search svelte-1lk6cpv" aria-label="Search" title="Search (⌘K / Ctrl+K)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <span class="sp-sidebar__search-label svelte-1lk6cpv">Search</span> <kbd class="sp-sidebar__search-kbd svelte-1lk6cpv">⌘K</kbd></button>`);
		}

		$$renderer.push(`<!--]--> `);
		toggle?.($$renderer);
		$$renderer.push(`<!----></div></aside>`);
	});
}