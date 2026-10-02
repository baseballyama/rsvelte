import * as $ from 'svelte/internal/server';
import { setTableContext } from "$lib/context";
import { table as tableCls } from "./theme";
import TableHead from "./TableHead.svelte";
import TableBody from "./TableBody.svelte";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			footerSlot,
			captionSlot,
			items,
			divClass,
			striped,
			hoverable,
			border = true,
			shadow,
			color = "default",
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Table", untrack(() => ({ divClass })), { divClass: "div" });

		const styling = $.derived(() => classes ?? { div: divClass });
		const theme = $.derived(() => getTheme("table"));

		const $$d = $.derived(() => tableCls({ color, shadow })),
			div = $.derived(() => $$d().div),
			table = $.derived(() => $$d().table);

		let tableCtx = {
			get striped() {
				return striped;
			},

			get hoverable() {
				return hoverable;
			},

			get border() {
				return border;
			},

			get color() {
				return color;
			}
		};

		setTableContext(tableCtx);

		let headItems = $.derived(() => items && items.length > 0
			? Object.keys(items[0]).map((key) => ({ text: key.charAt(0).toUpperCase() + key.slice(1) }))
			: []);

		let bodyItems = $.derived(() => items && items.length > 0 ? items.map((item) => Object.values(item)) : []);

		$$renderer.push(`<div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}><table${$.attributes({
			...restProps,
			class: $.clsx(table()({ class: clsx(theme()?.table, className) }))
		})}>`);

		if (captionSlot) {
			$$renderer.push('<!--[0-->');
			captionSlot($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (items && items.length > 0) {
			$$renderer.push('<!--[0-->');
			TableHead($$renderer, { headItems: headItems() });
			$$renderer.push(`<!----> `);
			TableBody($$renderer, { bodyItems: bodyItems() });
			$$renderer.push(`<!---->`);
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (footerSlot) {
			$$renderer.push('<!--[0-->');
			footerSlot($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></table></div>`);
	});
}