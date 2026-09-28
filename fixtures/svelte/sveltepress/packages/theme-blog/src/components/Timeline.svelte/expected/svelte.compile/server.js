import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { onMount } from 'svelte';

export default function Timeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { posts } = $$props;

		const MONTHS_SHORT = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];

		const MONTHS_LONG = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		// Posts are already sorted desc by date. Group by year+month, preserving order.
		const groups = $.derived(() => {
			const map = new Map();

			for (const p of posts) {
				const key = p.date.slice(0, 7);

				if (!map.has(key)) map.set(key, []);

				map.get(key).push(p);
			}

			return Array.from(map, ([key, posts]) => {
				const [year, m] = key.split('-');

				return { key, year, month: MONTHS_LONG[Number(m) - 1], posts };
			});
		});

		function fmtDate(iso) {
			const [, m, d] = iso.split('-');

			return `${MONTHS_SHORT[Number(m) - 1]} ${Number(d)}`;
		}

		const totalPosts = $.derived(() => posts.length);

		const yearSpan = $.derived(() => {
			if (!posts.length) return '';

			const newest = posts[0].date.slice(0, 4);
			const oldest = posts[posts.length - 1].date.slice(0, 4);

			return newest === oldest ? newest : `${oldest}–${newest}`;
		});

		let container = void 0;

		onMount(() => {
			if (!container) return;

			const io = new IntersectionObserver(
				(entries) => {
					for (const e of entries) {
						if (e.isIntersecting) {
							e.target.classList.add('is-visible');
							io.unobserve(e.target);
						}
					}
				},
				{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
			);

			container.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

			return () => io.disconnect();
		});

		$$renderer.push(`<div class="sp-tl svelte-yy4qai"><header class="sp-tl__hero svelte-yy4qai"><span class="sp-tl__eyebrow svelte-yy4qai">Archive</span> <h1 class="sp-tl__title svelte-yy4qai">Timeline <span class="sp-tl__title-accent svelte-yy4qai">.</span></h1> <p class="sp-tl__subtitle svelte-yy4qai"><strong class="svelte-yy4qai">${$.escape(totalPosts())}</strong> ${$.escape(totalPosts() === 1 ? 'post' : 'posts')} <span class="sp-tl__sep svelte-yy4qai">·</span> <strong class="svelte-yy4qai">${$.escape(yearSpan())}</strong></p></header> <!--[-->`);

		const each_array = $.ensure_array_like(groups());

		for (let gi = 0, $$length = each_array.length; gi < $$length; gi++) {
			let group = each_array[gi];

			$$renderer.push(`<section class="sp-tl__year-group svelte-yy4qai"${$.attr_style(`--gi: ${$.stringify(gi)}`)}><div class="sp-tl__year-col svelte-yy4qai"><div class="sp-tl__year svelte-yy4qai" data-reveal=""><span class="sp-tl__year-num svelte-yy4qai">${$.escape(group.month)}</span> <span class="sp-tl__year-sub svelte-yy4qai">${$.escape(group.year)}</span> <span class="sp-tl__year-count svelte-yy4qai">${$.escape(group.posts.length)}
            ${$.escape(group.posts.length === 1 ? 'post' : 'posts')}</span></div></div> <ol class="sp-tl__list svelte-yy4qai"><!--[-->`);

			const each_array_1 = $.ensure_array_like(group.posts);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let post = each_array_1[i];

				$$renderer.push(`<li class="sp-tl__item svelte-yy4qai" data-reveal=""${$.attr_style(`--i: ${$.stringify(i)}`)}><span class="sp-tl__dot svelte-yy4qai" aria-hidden="true"></span> <a${$.attr('href', `${base}/posts/${post.slug}/`)} class="sp-tl__card svelte-yy4qai"><div class="sp-tl__meta svelte-yy4qai"><time class="sp-tl__date svelte-yy4qai">${$.escape(fmtDate(post.date))}</time> `);

				if (post.category) {
					$$renderer.push(`<!--[0--><span class="sp-tl__cat svelte-yy4qai">${$.escape(post.category)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="sp-tl__reading svelte-yy4qai">${$.escape(post.readingTime)} min</span></div> <h2 class="sp-tl__post-title svelte-yy4qai">${$.escape(post.title)}</h2> <p class="sp-tl__excerpt svelte-yy4qai">${$.escape(post.excerpt)}</p> `);

				if (post.tags.length) {
					$$renderer.push(`<!--[0--><div class="sp-tl__tags svelte-yy4qai"><!--[-->`);

					const each_array_2 = $.ensure_array_like(post.tags);

					for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
						let tag = each_array_2[$$index];

						$$renderer.push(`<span class="sp-tl__tag svelte-yy4qai">#${$.escape(tag)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a></li>`);
			}

			$$renderer.push(`<!--]--></ol></section>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}