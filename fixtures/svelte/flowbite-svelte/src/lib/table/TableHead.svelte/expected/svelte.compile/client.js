import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTableContext } from "$lib/context";
import TableHeadCell from "./TableHeadCell.svelte";
import { tableHead } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'headerSlot',
	'color',
	'striped',
	'border',
	'class',
	'headItems',
	'defaultRow'
]);

var root = $.from_html(`<!> <tr></tr>`, 1);
var root_1 = $.from_html(`<tr><!></tr>`);
var root_2 = $.from_html(`<thead><!></thead>`);

export default function TableHead($$anchor, $$props) {
	$.push($$props, true);

	let defaultRow = $.prop($$props, 'defaultRow', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("tableHead"));
	const tableCtx = getTableContext();

	// for reactivity with svelte context
	let compoColor = $.derived(() => $$props.color ? $$props.color : tableCtx?.color || "default");

	let compoStriped = $.derived(() => $$props.striped ? $$props.striped : tableCtx?.striped || false);
	let compoBorder = $.derived(() => $$props.border ? $$props.border : tableCtx?.border || false);

	const base = $.derived(() => tableHead({
		color: $.get(compoColor),
		border: $.get(compoBorder),
		striped: $.get(compoStriped),
		class: clsx($.get(theme), $$props.class)
	}));

	function getItemText(item) {
		if (typeof item === "object" && "text" in item) {
			return item.text;
		}

		return String(item);
	}

	var thead = root_2();

	$.attribute_effect(thead, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(thead);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.headerSlot);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.headerSlot) $$render(consequent);
				});
			}

			var tr = $.sibling(node_1, 2);

			$.each(tr, 21, () => $$props.headItems, $.index, ($$anchor, item) => {
				TableHeadCell($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(($0) => $.set_text(text, $0), [() => getItemText($.get(item))]);
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(tr);
			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_3 = $.first_child(fragment_4);

			{
				var consequent_2 = ($$anchor) => {
					var tr_1 = root_1();
					var node_4 = $.child(tr_1);

					$.snippet(node_4, () => $$props.children);
					$.reset(tr_1);
					$.append($$anchor, tr_1);
				};

				var alternate = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					$.snippet(node_5, () => $$props.children);
					$.append($$anchor, fragment_5);
				};

				$.if(node_3, ($$render) => {
					if (defaultRow()) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if ($$props.headItems) $$render(consequent_1); else if ($$props.children) $$render(consequent_3, 1);
		});
	}

	$.reset(thead);
	$.append($$anchor, thead);
	$.pop();
}