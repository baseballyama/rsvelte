import * as $ from 'svelte/internal/server';
import { setTableContext } from "$lib/context";
import clsx from "clsx";
import { tableSearch } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function TableSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			header,
			footer,
			divClass,
			inputValue = void 0,
			striped = false,
			hoverable = false,
			customColor = "",
			color = "default",
			innerDivClass,
			inputClass,
			searchClass,
			svgDivClass,
			svgClass,
			tableClass,
			class: className,
			classes,
			placeholder = "Search",
			oninput,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"TableSearch",
			untrack(() => ({
				divClass,
				innerDivClass,
				inputClass,
				searchClass,
				svgDivClass,
				svgClass,
				tableClass
			})),
			{
				divClass: "root",
				innerDivClass: "inner",
				inputClass: "input",
				searchClass: "search",
				svgDivClass: "svgDiv",
				svgClass: "svg",
				tableClass: "table"
			}
		);

		const styling = $.derived(() => classes ?? {
			root: divClass,
			inner: innerDivClass,
			input: inputClass,
			search: searchClass,
			svgDiv: svgDivClass,
			svg: svgClass,
			table: tableClass
		});

		const theme = $.derived(() => getTheme("tableSearch"));
		const themeColor = $.derived(() => color === "custom" ? "default" : color);

		const $$d = $.derived(() => tableSearch({ color: themeColor(), striped, hoverable })),
			root = $.derived(() => $$d().root),
			inner = $.derived(() => $$d().inner),
			search = $.derived(() => $$d().search),
			svgDiv = $.derived(() => $$d().svgDiv),
			svg = $.derived(() => $$d().svg),
			input = $.derived(() => $$d().input),
			table = $.derived(() => $$d().table);

		const tableCls = $.derived(() => table()({ class: clsx(tableClass, theme()?.table, className) }));

		// Handle custom color
		const finalTableClass = $.derived(() => color === "custom" && customColor ? clsx(tableCls(), customColor) : tableCls());

		const tableSearchCtx = {
			get striped() {
				return striped;
			},

			get hoverable() {
				return hoverable;
			},

			get color() {
				return themeColor();
			}
		};

		setTableContext(tableSearchCtx);
		$$renderer.push(`<div${$.attr_class($.clsx(root()({ class: clsx(theme()?.root, styling().root) })))}><div${$.attr_class($.clsx(inner()({ class: clsx(theme()?.inner, styling().inner) })))}><label for="table-search" class="sr-only">Search</label> <div${$.attr_class($.clsx(search()({ class: clsx(theme()?.search, styling().search) })))}><div${$.attr_class($.clsx(svgDiv()({ class: clsx(theme()?.svgDiv, styling().svgDiv) })))}><svg${$.attr_class($.clsx(svg()({ class: clsx(theme()?.svg, styling().svg) })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg></div> <input${$.attr('value', inputValue)} type="text" id="table-search"${$.attr_class($.clsx(input()({ class: clsx(theme()?.input, styling().input) })))}${$.attr('placeholder', placeholder)}/></div> `);

		if (header) {
			$$renderer.push('<!--[0-->');
			header($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <table${$.attributes({ ...restProps, class: $.clsx(finalTableClass()) })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></table> `);

		if (footer) {
			$$renderer.push('<!--[0-->');
			footer($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { inputValue });
	});
}