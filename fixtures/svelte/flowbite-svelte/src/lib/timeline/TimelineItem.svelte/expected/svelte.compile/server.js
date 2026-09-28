import * as $ from 'svelte/internal/server';
import { getContext, untrack } from "svelte";
import { timelineItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

export default function TimelineItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			orientationSlot,
			title,
			date,
			dateFormat = "month-year",
			color = "primary",
			isLast = false,
			svgClass,
			liClass,
			defaultDivClass,
			divClass,
			timeClass,
			h3Class,
			connectorClass,
			datePrefix,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"TimelineItem",
			untrack(() => ({
				svgClass,
				liClass,
				divClass,
				timeClass,
				h3Class,
				connectorClass
			})),
			{
				liClass: "class",
				svgClass: "svg",
				divClass: "div",
				timeClass: "time",
				h3Class: "h3",
				connectorClass: "connector"
			}
		);

		const styling = $.derived(() => ({
			svg: svgClass,
			div: divClass,
			time: timeClass,
			h3: h3Class,
			connector: connectorClass
		}));

		const theme = $.derived(() => getTheme("timelineItem"));
		let order = getContext("order");

		const $$d = $.derived(() => timelineItem({ order, color, isLast })),
			base = $.derived(() => $$d().base),
			div = $.derived(() => $$d().div),
			defaultDiv = $.derived(() => $$d().defaultDiv),
			time = $.derived(() => $$d().time),
			h3 = $.derived(() => $$d().h3),
			svg = $.derived(() => $$d().svg),
			connector = $.derived(() => $$d().connector);

		const defaultDivCls = $.derived(() => defaultDivClass ? defaultDivClass : defaultDiv()());

		function formatDisplayDate(dateStr, format) {
			const date = new Date(dateStr);

			if (isNaN(date.getTime())) return dateStr;

			switch (format) {
				case "year":
					return date.toLocaleDateString(undefined, { year: "numeric" });

				case "month-year":
					return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

				case "full-date":
					return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

				default:
					return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
			}
		}

		$$renderer.push(`<li${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className ?? liClass) }))
		})}>`);

		if (!isLast && (order === "vertical" || order === "activity")) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(connector()({ class: clsx(theme()?.connector, styling().connector) })))} aria-hidden="true"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (order !== "default") {
			$$renderer.push('<!--[0-->');

			if (orientationSlot && (order === "vertical" || order === "horizontal")) {
				$$renderer.push('<!--[0-->');
				orientationSlot($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}><svg aria-hidden="true"${$.attr_class($.clsx(svg()({ class: clsx(theme()?.svg, styling().svg) })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (date) {
			$$renderer.push(`<!--[1--><div${$.attr_class($.clsx(defaultDivCls()))} aria-hidden="true"></div> <time${$.attr('datetime', date)}${$.attr_class($.clsx(time()({ class: clsx(theme()?.time, styling().time) })))}>${$.escape(datePrefix)}
      ${$.escape(formatDisplayDate(date, dateFormat))}</time>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (title) {
			$$renderer.push(`<!--[0--><h3${$.attr_class($.clsx(h3()({ class: clsx(theme()?.h3, styling().h3) })))}>${$.escape(title)}</h3>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (order !== "default") {
			$$renderer.push('<!--[0-->');

			if (date) {
				$$renderer.push(`<!--[0--><time${$.attr('datetime', date)}${$.attr_class($.clsx(time()({ class: clsx(theme()?.time, styling().time) })))}>${$.escape(datePrefix)}
        ${$.escape(formatDisplayDate(date, dateFormat))}</time>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----></li>`);
	});
}