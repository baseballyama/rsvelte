import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setTableContext } from "$lib/context";
import clsx from "clsx";
import { tableSearch } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'header',
	'footer',
	'divClass',
	'inputValue',
	'striped',
	'hoverable',
	'customColor',
	'color',
	'innerDivClass',
	'inputClass',
	'searchClass',
	'svgDivClass',
	'svgClass',
	'tableClass',
	'class',
	'classes',
	'placeholder',
	'oninput'
]);

var root_1 = $.from_html(`<div><div><label for="table-search" class="sr-only">Search</label> <div><div><svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg></div> <input type="text" id="table-search"/></div> <!></div> <table><!></table> <!></div>`);

export default function TableSearch($$anchor, $$props) {
	$.push($$props, true);

	let inputValue = $.prop($$props, 'inputValue', 15),
		striped = $.prop($$props, 'striped', 3, false),
		hoverable = $.prop($$props, 'hoverable', 3, false),
		customColor = $.prop($$props, 'customColor', 3, ""),
		color = $.prop($$props, 'color', 3, "default"),
		placeholder = $.prop($$props, 'placeholder', 3, "Search"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"TableSearch",
		untrack(() => ({
			divClass: $$props.divClass,
			innerDivClass: $$props.innerDivClass,
			inputClass: $$props.inputClass,
			searchClass: $$props.searchClass,
			svgDivClass: $$props.svgDivClass,
			svgClass: $$props.svgClass,
			tableClass: $$props.tableClass
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

	const styling = $.derived(() => $$props.classes ?? {
		root: $$props.divClass,
		inner: $$props.innerDivClass,
		input: $$props.inputClass,
		search: $$props.searchClass,
		svgDiv: $$props.svgDivClass,
		svg: $$props.svgClass,
		table: $$props.tableClass
	});

	const theme = $.derived(() => getTheme("tableSearch"));
	const themeColor = $.derived(() => color() === "custom" ? "default" : color());

	const $$d = $.derived(() => tableSearch({
			color: $.get(themeColor),
			striped: striped(),
			hoverable: hoverable()
		})),
		root = $.derived(() => $.get($$d).root),
		inner = $.derived(() => $.get($$d).inner),
		search = $.derived(() => $.get($$d).search),
		svgDiv = $.derived(() => $.get($$d).svgDiv),
		svg = $.derived(() => $.get($$d).svg),
		input = $.derived(() => $.get($$d).input),
		table = $.derived(() => $.get($$d).table);

	const tableCls = $.derived(() => $.get(table)({
		class: clsx($$props.tableClass, $.get(theme)?.table, $$props.class)
	}));

	// Handle custom color
	const finalTableClass = $.derived(() => color() === "custom" && customColor()
		? clsx($.get(tableCls), customColor())
		: $.get(tableCls));

	const tableSearchCtx = {
		get striped() {
			return striped();
		},

		get hoverable() {
			return hoverable();
		},

		get color() {
			return $.get(themeColor);
		}
	};

	setTableContext(tableSearchCtx);

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var svg_1 = $.only_child(div_3);
	var input_1 = $.sibling(div_3, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.header);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	$.reset(div_1);

	var table_1 = $.sibling(div_1, 2);

	$.attribute_effect(table_1, () => ({ ...restProps, class: $.get(finalTableClass) }));

	var node_2 = $.child(table_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.reset(table_1);

	var node_4 = $.sibling(table_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.snippet(node_5, () => $$props.footer);
			$.append($$anchor, fragment_2);
		};

		$.if(node_4, ($$render) => {
			if ($$props.footer) $$render(consequent_2);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
			$.set_class(div_2, 1, $2);
			$.set_class(div_3, 1, $3);
			$.set_class(svg_1, 0, $4);
			$.set_class(input_1, 1, $5);
			$.set_attribute(input_1, 'placeholder', placeholder());
		},
		[
			() => $.clsx($.get(root)({ class: clsx($.get(theme)?.root, $.get(styling).root) })),
			() => $.clsx($.get(inner)({ class: clsx($.get(theme)?.inner, $.get(styling).inner) })),
			() => $.clsx($.get(search)({ class: clsx($.get(theme)?.search, $.get(styling).search) })),
			() => $.clsx($.get(svgDiv)({ class: clsx($.get(theme)?.svgDiv, $.get(styling).svgDiv) })),
			() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $.get(styling).svg) })),
			() => $.clsx($.get(input)({ class: clsx($.get(theme)?.input, $.get(styling).input) }))
		]
	);

	$.delegated('input', input_1, function (...$$args) {
		$$props.oninput?.apply(this, $$args);
	});

	$.bind_value(input_1, inputValue);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);