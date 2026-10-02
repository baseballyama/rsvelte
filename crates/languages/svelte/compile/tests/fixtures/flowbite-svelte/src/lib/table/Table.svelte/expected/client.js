import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setTableContext } from "$lib/context";
import { table as tableCls } from "./theme";
import TableHead from "./TableHead.svelte";
import TableBody from "./TableBody.svelte";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'footerSlot',
	'captionSlot',
	'items',
	'divClass',
	'striped',
	'hoverable',
	'border',
	'shadow',
	'color',
	'class',
	'classes'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><table><!><!><!></table></div>`);

export default function Table($$anchor, $$props) {
	$.push($$props, true);

	let border = $.prop($$props, 'border', 3, true),
		color = $.prop($$props, 'color', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Table", untrack(() => ({ divClass: $$props.divClass })), { divClass: "div" });

	const styling = $.derived(() => $$props.classes ?? { div: $$props.divClass });
	const theme = $.derived(() => getTheme("table"));

	const $$d = $.derived(() => tableCls({ color: color(), shadow: $$props.shadow })),
		div = $.derived(() => $.get($$d).div),
		table = $.derived(() => $.get($$d).table);

	let tableCtx = {
		get striped() {
			return $$props.striped;
		},

		get hoverable() {
			return $$props.hoverable;
		},

		get border() {
			return border();
		},

		get color() {
			return color();
		}
	};

	setTableContext(tableCtx);

	let headItems = $.derived(() => $$props.items && $$props.items.length > 0
		? Object.keys($$props.items[0]).map((key) => ({ text: key.charAt(0).toUpperCase() + key.slice(1) }))
		: []);

	let bodyItems = $.derived(() => $$props.items && $$props.items.length > 0 ? $$props.items.map((item) => Object.values(item)) : []);
	var div_1 = root_1();
	var table_1 = $.child(div_1);

	$.attribute_effect(table_1, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(table)({ class: clsx($.get(theme)?.table, $$props.class) })
	]);

	var node = $.child(table_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.captionSlot);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.captionSlot) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			TableHead(node_3, {
				get headItems() {
					return $.get(headItems);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			TableBody(node_4, {
				get bodyItems() {
					return $.get(bodyItems);
				}
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.snippet(node_5, () => $$props.children);
			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.items && $$props.items.length > 0) $$render(consequent_1); else if ($$props.children) $$render(consequent_2, 1);
		});
	}

	var node_6 = $.sibling(node_2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_7 = $.first_child(fragment_3);

			$.snippet(node_7, () => $$props.footerSlot);
			$.append($$anchor, fragment_3);
		};

		$.if(node_6, ($$render) => {
			if ($$props.footerSlot) $$render(consequent_3);
		});
	}

	$.reset(table_1);
	$.reset(div_1);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) }))
	]);

	$.append($$anchor, div_1);
	$.pop();
}