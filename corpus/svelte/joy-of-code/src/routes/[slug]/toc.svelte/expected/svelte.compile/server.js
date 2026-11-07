import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import { ChevronDoubleLeft, ChevronDoubleRight } from '$lib/icons';

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const TABLE_OF_CONTENTS = '#table-of-contents + ul';
		let tableOfContents = [];
		let showSidebar = false;

		onMount(() => {
			const toc = document.querySelector(TABLE_OF_CONTENTS);

			if (!toc) return;

			tableOfContents = [...toc.querySelectorAll('a')].map((a, i) => ({
				title: a.textContent,
				href: a.getAttribute('href'),
				active: false
			}));

			if (window.innerWidth >= 1440) {
				const observer = new IntersectionObserver(([entry]) => {
					showSidebar = entry.boundingClientRect.bottom < 0;
				});

				observer.observe(toc);

				return () => observer.unobserve(toc);
			}
		});

		onMount(() => {
			const headings = document.querySelectorAll('h2');

			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						tableOfContents.forEach((i) => i.active = false);

						const title = entry.target.textContent;
						const index = tableOfContents.findIndex((i) => i.title === title);

						if (index >= 0) tableOfContents[index].active = true;
					}
				},
				{ rootMargin: '0px 0px -90% 0px' }
			);

			headings.forEach((heading) => observer.observe(heading));

			return () => observer.disconnect();
		});

		function toggleSidebar() {
			showSidebar = !showSidebar;
		}

		if (tableOfContents) {
			$$renderer.push(`<!--[0--><aside class="svelte-1it2h8m"><section>`);

			if (showSidebar) {
				$$renderer.push(`<!--[0--><div class="table-of-contents svelte-1it2h8m"><button aria-label="Hide table of contents" class="svelte-1it2h8m">`);
				ChevronDoubleRight($$renderer, { width: 24, height: 24, 'aria-hidden': true });
				$$renderer.push(`<!----> <h2 class="table-of-contents-title svelte-1it2h8m">Sections</h2></button> <ul class="svelte-1it2h8m"><!--[-->`);

				const each_array = $.ensure_array_like(tableOfContents);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { active, title, href } = each_array[$$index];

					$$renderer.push(`<li class="svelte-1it2h8m"><a${$.attr('href', href)}${$.attr('data-active', active)} class="svelte-1it2h8m">${$.escape(title)}</a></li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push(`<!--[-1--><button class="sidebar-toggle svelte-1it2h8m" aria-label="Show table of contents">`);
				ChevronDoubleLeft($$renderer, { width: 24, height: 24, 'aria-hidden': true });
				$$renderer.push(`<!----></button>`);
			}

			$$renderer.push(`<!--]--></section></aside>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}