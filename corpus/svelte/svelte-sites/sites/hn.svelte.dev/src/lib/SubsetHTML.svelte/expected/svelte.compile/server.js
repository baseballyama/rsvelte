import * as $ from 'svelte/internal/server';
import { parse } from './htmlSubsetParse';
import { resolve } from '$app/paths';

export default function SubsetHTML($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { content } = $$props;
		const parsedContent = $.derived(() => parse(content));
		const HN_HOSTNAME = 'news.ycombinator.com';

		function tryRewriteLink(originalUrl) {
			const { hostname, pathname, searchParams, hash, href } = originalUrl;

			if (hostname === HN_HOSTNAME && pathname === '/item') {
				// for the purposes of typescript control flow,
				// .has() does not impact .get()
				const itemId = searchParams.get('id');

				if (itemId) {
					// only support rewriting /item?id= links
					// which actually covers most legitimate uses
					return {
						href: `${resolve('/item/[id=numeric]', { id: itemId })}${hash}`,
						rel: undefined
					};
				}
			}

			// otherwise spit back original
			return { href, rel: 'external' };
		}

		function inline($$renderer, child) {
			if (child.type === 'text') {
				$$renderer.push(`<!--[0-->${$.escape(child.text)}`);
			} else if (child.type === 'link') {
				$$renderer.push('<!--[1-->');

				const originalUrl = new URL(child.href);

				if (['http:', 'https:'].includes(originalUrl.protocol)) {
					$$renderer.push('<!--[0-->');

					const { href, rel } = tryRewriteLink(originalUrl);

					$$renderer.push(`<a${$.attr('href', href)}${$.attr('rel', rel)}>${$.escape(child.text)}</a>`);
				} else {
					$$renderer.push(`<!--[-1--><del>${$.escape(child.text)}</del>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (child.type === 'italic') {
				$$renderer.push(`<!--[2--><!--[-->`);

				const each_array = $.ensure_array_like(child.children);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let subchild = each_array[$$index];

					inline($$renderer, subchild);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(parsedContent());

		for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
			let block = each_array_1[$$index_2];

			if (block.type === 'paragraph') {
				$$renderer.push(`<!--[0--><p><!--[-->`);

				const each_array_2 = $.ensure_array_like(block.children);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let child = each_array_2[$$index_1];

					inline($$renderer, child);
				}

				$$renderer.push(`<!--]--></p>`);
			} else {
				$$renderer.push(`<!--[-1--><pre><code>${$.escape(block.text)}</code></pre>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}