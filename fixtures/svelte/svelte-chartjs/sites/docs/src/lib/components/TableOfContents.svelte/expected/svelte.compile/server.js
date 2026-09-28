import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function TableOfContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ article: HTMLElement }} */
		let { article } = $$props;

		let headings = [];
		let activeId = '';

		onMount(() => {
			if (!article) return;

			const nodes = article.querySelectorAll('h2[id], h3[id]');

			headings = Array.from(nodes).map((el) => ({
				id: el.id,
				text: el.textContent ?? '',
				level: el.tagName === 'H3' ? 3 : 2
			}));

			if (headings.length < 2) {
				headings = [];

				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
						}
					}
				},
				{ rootMargin: '-80px 0px -60% 0px' }
			);

			for (const node of nodes) {
				observer.observe(node);
			}

			return () => observer.disconnect();
		});

		if (headings.length >= 2) {
			$$renderer.push(`<!--[0--><nav class="toc svelte-1240kco" aria-label="Table of contents"><h4 class="toc-title svelte-1240kco">On this page</h4> <ul class="svelte-1240kco"><!--[-->`);

			const each_array = $.ensure_array_like(headings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let heading = each_array[$$index];

				$$renderer.push(`<li${$.attr_class('svelte-1240kco', void 0, { 'indent': heading.level === 3 })}><a${$.attr('href', `#${$.stringify(heading.id)}`)}${$.attr_class('svelte-1240kco', void 0, { 'active': activeId === heading.id })}>${$.escape(heading.text)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}