import * as $ from 'svelte/internal/server';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function AuthorProfile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const author = $.derived(() => blogConfig.author);

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

					if (v) out.push({ label: d.label, href: d.href(v) });
				}
			}

			return out;
		});

		if (author()) {
			$$renderer.push(`<!--[0--><section class="sp-profile svelte-1t7gz0j">`);

			if (author().avatar) {
				$$renderer.push(`<!--[0--><img class="sp-profile__avatar svelte-1t7gz0j"${$.attr('src', author().avatar)} alt="" width="128" height="128"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <h1 class="sp-profile__name svelte-1t7gz0j">${$.escape(author().name)}</h1> `);

			if (author().bio) {
				$$renderer.push(`<!--[0--><p class="sp-profile__bio svelte-1t7gz0j">${$.escape(author().bio)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (socials().length) {
				$$renderer.push(`<!--[0--><ul class="sp-profile__socials svelte-1t7gz0j"><!--[-->`);

				const each_array = $.ensure_array_like(socials());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					$$renderer.push(`<li><a${$.attr('href', s.href)} rel="me" class="svelte-1t7gz0j">${$.escape(s.label)}</a></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}