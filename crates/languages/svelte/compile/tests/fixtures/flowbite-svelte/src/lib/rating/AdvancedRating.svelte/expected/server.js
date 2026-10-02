import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { advancedRating } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function AdvancedRating($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			rating,
			globalText,
			ratings,
			divClass,
			spanClass,
			div2Class,
			div3Class,
			span2Class,
			class: className,
			classes,
			unit
		} = $$props;

		warnThemeDeprecation("AdvancedRating", untrack(() => ({ divClass, spanClass, div2Class, div3Class, span2Class })), {
			divClass: "class",
			spanClass: "span",
			div2Class: "div2",
			div3Class: "div3",
			span2Class: "span2"
		});

		const styling = $.derived(() => classes ?? {
			span: spanClass,
			div2: div2Class,
			div3: div3Class,
			span2: span2Class
		});

		const theme = $.derived(() => getTheme("advancedRating"));

		const $$d = $.derived(advancedRating),
			base = $.derived(() => $$d().base),
			span = $.derived(() => $$d().span),
			div2 = $.derived(() => $$d().div2),
			div3 = $.derived(() => $$d().div3),
			span2 = $.derived(() => $$d().span2);

		if (rating) {
			$$renderer.push('<!--[0-->');
			rating($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (globalText) {
			$$renderer.push('<!--[0-->');
			globalText($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(ratings);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let { label, rating } = each_array[i];

			$$renderer.push(`<div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(label)}</span> <div${$.attr_class($.clsx(div2()({ class: clsx(theme()?.div2, styling().div2) })))}><div${$.attr_class($.clsx(div3()({ class: clsx(theme()?.div3, styling().div3) })))}${$.attr_style(`width: ${$.stringify(rating)}%`)}></div></div> <span${$.attr_class($.clsx(span2()({ class: clsx(theme()?.span2, styling().span2) })))}>${$.escape(rating)}${$.escape(unit)}</span></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}