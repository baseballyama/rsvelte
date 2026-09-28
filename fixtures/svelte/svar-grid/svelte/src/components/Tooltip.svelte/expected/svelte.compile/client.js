import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getRenderValue } from "@svar-ui/grid-store";
import { Tooltip } from "@svar-ui/svelte-core";
import { getID } from "@svar-ui/lib-dom";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'api',
	'at',
	'overflow',
	'content',
	'resolver'
]);

export default function Tooltip_1($$anchor, $$props) {
	$.push($$props, true);

	let at = $.prop($$props, 'at', 3, "point"),
		overflow = $.prop($$props, 'overflow', 3, false),
		Content = $.prop($$props, 'content', 3, null),
		resolver = $.prop($$props, 'resolver', 3, defaultResolver),
		restProps = $.rest_props($$props, rest_excludes);

	function defaultResolver(element) {
		if (!$$props.api) return null;

		const rowId = getID(element, "data-row-id");
		const columnId = getID(element, "data-col-id");

		if (!rowId || !columnId) return null;

		const row = $$props.api.getRow(rowId);
		const column = $$props.api.getColumn(columnId);

		if (column.tooltip === false) return null;
		if (overflow() && element.scrollWidth <= element.clientWidth) return null;

		if (Content()) {
			return { data: { row, column } };
		} else {
			if (typeof column.tooltip === "function") {
				return column.tooltip(row);
			}

			return getRenderValue(row, column);
		}
	}

	Tooltip($$anchor, $.spread_props(
		{
			get at() {
				return at();
			},

			get content() {
				return Content();
			},

			get resolver() {
				return resolver();
			}
		},
		() => restProps
	));

	$.pop();
}