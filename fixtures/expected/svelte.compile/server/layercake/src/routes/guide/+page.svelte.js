import * as $ from 'svelte/internal/server';
import GuideContents from '../_site-components/GuideContents.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		let { data } = $$props;

		/** @type {HTMLElement | undefined} */
		let container;

		/** @type {number[]} */
		let positions = [];

		let lastId = 'introduction';
		let activeGuideSection = void 0;

		/** @type {HTMLElement[]} */
		let anchors = [];

		/** @type {HTMLElement[]} */
		function onresize() {
			if (container) {
				const { top } = container.getBoundingClientRect();

				positions = anchors.map((anchor) => {
					return anchor.getBoundingClientRect().top - top;
				});
			}
		}

		function onscroll() {
			const top = -window.scrollY;
			let i = anchors.length;

			while (i--) {
				if (positions[i] + top < 100) {
					const anchor = anchors[i];
					const { id } = anchor;

					if (id !== lastId) {
						activeGuideSection = id;

						// this.fire('scroll', id);
						lastId = id;
					}

					return;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('36n0qb', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>LayerCake - Guide</title>`);
				});

				$$renderer.push(`<meta name="og:title" content="Layer Cake — Guide"/> <meta name="twitter:title" content="Layer Cake — Guide"/>`);
			});

			$$renderer.push(`<sidebar class="svelte-36n0qb">`);

			GuideContents($$renderer, {
				sections: data.sections,
				get activeGuideSection() {
					return activeGuideSection;
				},

				set activeGuideSection($$value) {
					activeGuideSection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></sidebar> <div id="container" class="content svelte-36n0qb"><section id="toc" class="svelte-36n0qb"><h3 class="svelte-36n0qb">Table of contents</h3> <ul class="svelte-36n0qb"><!--[-->`);

			const each_array = $.ensure_array_like(data.sections);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let section = each_array[$$index];

				$$renderer.push(`<li class="svelte-36n0qb"><a${$.attr('href', `#${$.stringify(section.slug)}`)} class="svelte-36n0qb">- ${$.escape(section.slug.replace(/^\w/, (d) => d.toUpperCase()).replaceAll('-', ' '))}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></section> <!--[-->`);

			const each_array_1 = $.ensure_array_like(data.sections);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let section = each_array_1[$$index_1];

				$$renderer.push(`<section${$.attr('id', section.slug)} class="svelte-36n0qb"><h2 class="svelte-36n0qb">${$.escape(section.metadata.title)} <small class="svelte-36n0qb"><a${$.attr('href', `https://github.com/mhkeller/layercake/edit/master/src/content/guide/${$.stringify(section.file)}`)} target="_blank" rel="noreferrer">edit this section</a></small></h2> ${$.html(section.html)}</section>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}