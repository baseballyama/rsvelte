import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { getStyle } from "../../helpers/columnWidth";
import { editors } from "./editors";
import { getValue } from "@svar-ui/grid-store";
import { isSame } from "@svar-ui/lib-state";

export default function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { column, row } = $$props;
		const api = getContext("grid-store");
		const { editor } = api.getReactiveState();

		function save(ignoreFocus) {
			const cell = getCell(ignoreFocus);
			const isSameValue = isSame(getValue(row, column), $.store_get($$store_subs ??= {}, '$editor', editor).value);

			closeEditor(isSameValue, cell);
		}

		function cancel(ignoreFocus) {
			const cell = getCell(ignoreFocus);

			closeEditor(true, cell);
		}

		function updateValue(value) {
			api.exec("editor", { value });
		}

		function closeEditor(ignore, cell) {
			api.exec("close-editor", { ignore });

			if (cell) {
				api.exec("focus-cell", { ...cell, eventSource: "click" });
			}
		}

		function getCell(ignoreFocus) {
			return ignoreFocus
				? null
				: {
					row: $.store_get($$store_subs ??= {}, '$editor', editor).id,
					column: $.store_get($$store_subs ??= {}, '$editor', editor).column
				};
		}

		function keyHandler(ev) {
			if (ev.key === "Enter" && $.store_get($$store_subs ??= {}, '$editor', editor)) {
				if (column.editor.type === "multiselect") {
					updateValue($.store_get($$store_subs ??= {}, '$editor', editor).value);
				} else {
					cancel();
				}
			}
		}

		let style = $.derived(() => getStyle(column.width, column.flexgrow, column.fixed, column.left, column.right));

		const SvelteComponent = $.derived(() => {
			let editor = column.editor;

			if (typeof editor === "function") editor = editor(row, column);

			let type = typeof editor === "string" ? editor : editor.type;

			return editors[type];
		});

		$$renderer.push(`<div class="wx-cell wx-editor svelte-16l51lz"${$.attr_style(style())}${$.attr('role', typeof row.$parent !== "undefined" ? "gridcell" : "cell")}${$.attr('aria-readonly', typeof row.$parent !== "undefined" ? column.editor ? false : true : undefined)} tabindex="-1">`);

		if (SvelteComponent()) {
			$$renderer.push('<!--[-->');

			SvelteComponent()($$renderer, {
				editor: $.store_get($$store_subs ??= {}, '$editor', editor),
				onsave: save,
				onapply: updateValue,
				oncancel: cancel,
				onaction: ({ action, data }) => api.exec(action, data)
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}