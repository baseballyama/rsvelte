import * as $ from 'svelte/internal/server';
import { activityItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function ActivityItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			activities,
			liClass,
			spanClass,
			imgClass,
			outerDivClass,
			innerDivClass,
			timeClass,
			titleClass,
			textClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"ActivityItem",
			untrack(() => ({
				liClass,
				spanClass,
				imgClass,
				outerDivClass,
				innerDivClass,
				timeClass,
				titleClass,
				textClass
			})),
			{
				liClass: "class",
				spanClass: "span",
				imgClass: "img",
				outerDivClass: "outer",
				innerDivClass: "inner",
				timeClass: "time",
				titleClass: "title",
				textClass: "text"
			}
		);

		const styling = $.derived(() => classes ?? {
			span: spanClass,
			img: imgClass,
			outer: outerDivClass,
			inner: innerDivClass,
			time: timeClass,
			title: titleClass,
			text: textClass
		});

		const theme = $.derived(() => getTheme("activityItem"));

		const $$d = $.derived(activityItem),
			li = $.derived(() => $$d().li),
			span = $.derived(() => $$d().span),
			img = $.derived(() => $$d().img),
			outer = $.derived(() => $$d().outer),
			inner = $.derived(() => $$d().inner),
			time = $.derived(() => $$d().time),
			title = $.derived(() => $$d().title),
			text = $.derived(() => $$d().text);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(activities);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let { title: name, date, src, alt, text: activity, id } = each_array[index];

			$$renderer.push(`<li${$.attributes({
				...restProps,
				class: $.clsx(li()({ class: clsx(theme()?.li, className ?? liClass) }))
			})}><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}><img${$.attr_class($.clsx(img()({ class: clsx(theme()?.img, styling().img) })))}${$.attr('src', src)}${$.attr('alt', alt)}/></span> <div${$.attr_class($.clsx(outer()({ class: clsx(theme()?.outer, styling().outer) })))}><div${$.attr_class($.clsx(inner()({ class: clsx(theme()?.inner, styling().inner) })))}><time${$.attr_class($.clsx(time()({ class: clsx(theme()?.time, styling().time) })))}>${$.escape(date)}</time> <div${$.attr_class($.clsx(title()({ class: clsx(theme()?.title, styling().title) })))}>${$.html(name)}</div></div> `);

			if (activity) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(text()({ class: clsx(theme()?.text, styling().text) })))}>${$.html(activity)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></li>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}