import * as $ from 'svelte/internal/server';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function SideRail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { category } = $$props;
		const blogTitle = $.derived(() => blogConfig.title ?? 'Blog');

		if (category) {
			$$renderer.push(`<!--[0--><div class="sp-siderail svelte-10u7wuu" aria-hidden="true">Issue · ${$.escape(blogTitle())} · ${$.escape(category)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}