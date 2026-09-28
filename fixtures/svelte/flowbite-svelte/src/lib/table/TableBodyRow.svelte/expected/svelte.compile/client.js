import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTableContext } from "$lib/context";
import { tableBodyRow } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'color',
	'striped',
	'hoverable',
	'border'
]);

var root = $.from_html(`<tr><!></tr>`);

export default function TableBodyRow($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("tableBodyRow"));
	const tableCtx = getTableContext();

	// for reactivity with svelte context
	let compoColor = $.derived(() => $$props.color || tableCtx?.color || "default");

	let compoHoverable = $.derived(() => $$props.hoverable || tableCtx?.hoverable || false);
	let compoStriped = $.derived(() => $$props.striped || tableCtx?.striped || false);
	let compoBorder = $.derived(() => $$props.border || tableCtx?.border || false);

	const base = $.derived(() => tableBodyRow({
		color: $.get(compoColor),
		hoverable: $.get(compoHoverable),
		striped: $.get(compoStriped),
		border: $.get(compoBorder),
		class: clsx($.get(theme), $$props.class)
	}));

	var tr = root();

	$.attribute_effect(tr, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(tr);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(tr);
	$.append($$anchor, tr);
	$.pop();
}