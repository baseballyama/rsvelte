import * as $ from 'svelte/internal/server';
import { getRenderValue } from "@svar-ui/grid-store";
import { Tooltip } from "@svar-ui/svelte-core";
import { getID } from "@svar-ui/lib-dom";

export default function Tooltip_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			api,
			at = "point",
			overflow = false,
			content: Content = null,
			resolver = defaultResolver,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function defaultResolver(element) {
			if (!api) return null;

			const rowId = getID(element, "data-row-id");
			const columnId = getID(element, "data-col-id");

			if (!rowId || !columnId) return null;

			const row = api.getRow(rowId);
			const column = api.getColumn(columnId);

			if (column.tooltip === false) return null;
			if (overflow && element.scrollWidth <= element.clientWidth) return null;

			if (Content) {
				return { data: { row, column } };
			} else {
				if (typeof column.tooltip === "function") {
					return column.tooltip(row);
				}

				return getRenderValue(row, column);
			}
		}

		Tooltip($$renderer, $.spread_props([{ at, content: Content, resolver }, restProps]));
	});
}