import * as $ from 'svelte/internal/server';
import { scoreRating } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function ScoreRating($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ratings, ratings2, headerLabel, classes } = $$props;
		const theme = $.derived(() => getTheme("scoreRating"));

		const $$d = $.derived(scoreRating),
			desc1 = $.derived(() => $$d().desc1),
			desc2 = $.derived(() => $$d().desc2),
			desc3span = $.derived(() => $$d().desc3span),
			desc3p = $.derived(() => $$d().desc3p),
			link = $.derived(() => $$d().link),
			bar = $.derived(() => $$d().bar);

		$$renderer.push(`<div class="mb-5 flex items-center">`);

		if (headerLabel) {
			$$renderer.push('<!--[0-->');

			if (headerLabel.desc1) {
				$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(desc1()({ class: clsx(theme()?.desc1, classes?.desc1) })))}>${$.escape(headerLabel.desc1)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (headerLabel.desc2) {
				$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(desc2()({ class: clsx(theme()?.desc2, classes?.desc2) })))}>${$.escape(headerLabel.desc2)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (headerLabel.desc3) {
				$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(desc3span()({ class: clsx(theme()?.desc3span, classes?.desc3span) })))}></span> <p${$.attr_class($.clsx(desc3p()({ class: clsx(theme()?.desc3p, classes?.desc3p) })))}>${$.escape(headerLabel.desc3)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (headerLabel.link) {
				$$renderer.push(`<!--[0--><a${$.attr('href', headerLabel.link.url)}${$.attr_class($.clsx(link()({ class: clsx(theme()?.link, classes?.link) })))}>${$.escape(headerLabel.link.label)}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="gap-8 sm:grid sm:grid-cols-2"><div>`);

		if (ratings) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(ratings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { label, rating } = each_array[$$index];

				$$renderer.push(`<dl><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">${$.escape(label)}</dt> <dd class="mb-3 flex items-center"><div class="me-2 h-2.5 w-full rounded-sm bg-gray-200 dark:bg-gray-700"><div${$.attr_class($.clsx(bar()({ class: clsx(theme()?.bar, classes?.bar) })))}${$.attr_style(`width: ${$.stringify(rating * 10)}%`)}></div></div> <span class="text-sm font-medium text-gray-500 dark:text-gray-400">${$.escape(rating)}</span></dd></dl>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div>`);

		if (ratings2) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_1 = $.ensure_array_like(ratings2);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let { label, rating } = each_array_1[$$index_1];

				$$renderer.push(`<dl><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">${$.escape(label)}</dt> <dd class="mb-3 flex items-center"><div class="me-2 h-2.5 w-full rounded-sm bg-gray-200 dark:bg-gray-700"><div${$.attr_class($.clsx(bar()({ class: clsx(theme()?.bar, classes?.bar) })))}${$.attr_style(`width: ${$.stringify(rating * 10)}%`)}></div></div> <span class="text-sm font-medium text-gray-500 dark:text-gray-400">${$.escape(rating)}</span></dd></dl>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}