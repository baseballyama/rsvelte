import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';
import SideRail from './SideRail.svelte';

export default function TableOfContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { category } = $$props;
		let headings = [];
		let activeId = '';

		onMount(() => {
			let els = [];
			let raf = 0;

			const collect = () => {
				els = Array.from(document.querySelectorAll('.sp-post-content h2, .sp-post-content h3')).filter((el) => el.id);

				headings = els.map((el) => ({
					id: el.id,
					text: el.textContent ?? '',
					level: Number(el.tagName[1])
				}));
			};

			// Active = last heading whose top has crossed the trigger line
			// (20% from viewport top). Matches how Nuxt / VitePress handle it.
			const compute = () => {
				if (!els.length) return;

				const trigger = window.innerHeight * 0.2;
				let current = els[0].id;

				for (const el of els) {
					if (el.getBoundingClientRect().top - trigger < 1) current = el.id; else break;
				}

				// If we're above the first heading, no section is active yet.
				if (els[0].getBoundingClientRect().top > trigger) current = '';

				activeId = current;
			};

			const onScroll = () => {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(compute);
			};

			collect();
			compute();

			// Re-collect once DOM settles (headings may render after mount via {@html}).
			tick().then(() => {
				collect();
				compute();
			});

			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', onScroll);

			return () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('scroll', onScroll);
				window.removeEventListener('resize', onScroll);
			};
		});

		$$renderer.push(`<div class="sp-toc-wrap svelte-pcfkz4">`);
		SideRail($$renderer, { category });
		$$renderer.push(`<!----> `);

		if (headings.length) {
			$$renderer.push(`<!--[0--><nav class="sp-toc svelte-pcfkz4"><p class="sp-toc__label svelte-pcfkz4">On this page</p> <ul class="svelte-pcfkz4"><!--[-->`);

			const each_array = $.ensure_array_like(headings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let h = each_array[$$index];

				$$renderer.push(`<li${$.attr_class('sp-toc__item svelte-pcfkz4', void 0, { 'sp-toc__item--h3': h.level === 3 })}><a${$.attr('href', `#${h.id}`)}${$.attr_class('sp-toc__link svelte-pcfkz4', void 0, { 'sp-toc__link--active': activeId === h.id })}>${$.escape(h.text)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}