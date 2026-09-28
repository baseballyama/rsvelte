import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { review as reviewVariants } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Review($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			address,
			item1,
			item2,
			item3,
			review,
			classes,
			articleClass,
			divClass,
			div2Class,
			div3Class,
			imgClass,
			ulClass,
			liClass
		} = $$props;

		warnThemeDeprecation(
			"Review",
			untrack(() => ({
				articleClass,
				divClass,
				div2Class,
				div3Class,
				imgClass,
				ulClass,
				liClass
			})),
			{
				articleClass: "article",
				divClass: "div",
				div2Class: "div2",
				div3Class: "div3",
				imgClass: "img",
				ulClass: "ul",
				liClass: "li"
			}
		);

		const styling = $.derived(() => classes ?? {
			article: articleClass,
			div: divClass,
			div2: div2Class,
			div3: div3Class,
			img: imgClass,
			ul: ulClass,
			li: liClass
		});

		const theme = $.derived(() => getTheme("review"));

		const $$d = $.derived(reviewVariants),
			article = $.derived(() => $$d().article),
			div = $.derived(() => $$d().div),
			div2 = $.derived(() => $$d().div2),
			div3 = $.derived(() => $$d().div3),
			img = $.derived(() => $$d().img),
			ul = $.derived(() => $$d().ul),
			li = $.derived(() => $$d().li);

		if (review) {
			$$renderer.push(`<!--[0--><article${$.attr_class($.clsx(article()({ class: clsx(theme()?.article, styling().article) })))}><div><div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}><img${$.attr_class($.clsx(img()({ class: clsx(theme()?.img, styling().img) })))}${$.attr('src', review.imgSrc)}${$.attr('alt', review.imgAlt)}/> <div${$.attr_class($.clsx(div2()({ class: clsx(theme()?.div2, styling().div2) })))}><p>${$.escape(review.name)}</p> `);

			if (review.address) {
				$$renderer.push('<!--[0-->');

				if (address) {
					$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(div3()({ class: clsx(theme()?.div3, styling().div3) })))}>`);
					address($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (review.item1 || review.item2 || review.item3) {
				$$renderer.push(`<!--[0--><ul${$.attr_class($.clsx(ul()({ class: clsx(theme()?.ul, styling().ul) })))}>`);

				if (review.item1) {
					$$renderer.push(`<!--[0--><li${$.attr_class($.clsx(li()({ class: clsx(theme()?.li, styling().li) })))}>`);

					if (item1) {
						$$renderer.push('<!--[0-->');
						item1($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></li>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (review.item2) {
					$$renderer.push(`<!--[0--><li${$.attr_class($.clsx(clsx(styling().li)))}>`);

					if (item2) {
						$$renderer.push('<!--[0-->');
						item2($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></li>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (review.item3) {
					$$renderer.push(`<!--[0--><li${$.attr_class($.clsx(clsx(styling().li)))}>`);

					if (item3) {
						$$renderer.push('<!--[0-->');
						item3($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></li>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="col-span-2 mt-6 md:mt-0"><div class="mb-5 flex items-start"><div class="pe-4">`);

			if (review.reviewDate) {
				$$renderer.push(`<!--[0--><footer><p class="mb-2 text-sm text-gray-500 dark:text-gray-400">Reviewed: ${$.escape(review.reviewDate)}</p></footer>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <h4 class="text-xl font-bold text-gray-900 dark:text-white">${$.escape(review.title)}</h4></div> <p class="bg-primary-700 inline-flex items-center rounded-sm p-1.5 text-sm font-semibold text-white">${$.escape(review.rating)}</p></div> `);
			children($$renderer);
			$$renderer.push(`<!----></div></article>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}