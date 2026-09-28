import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getStyle } from "../../helpers/columnWidth";
import { editors } from "./editors";
import { getValue } from "@svar-ui/grid-store";
import { isSame } from "@svar-ui/lib-state";

var root = $.from_html(`<div class="wx-cell wx-editor svelte-16l51lz" tabindex="-1"><!></div>`);

export default function Editor($$anchor, $$props) {
	$.push($$props, true);

	const $editor = () => $.store_get(editor, '$editor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const api = getContext("grid-store");
	const { editor } = api.getReactiveState();

	function save(ignoreFocus) {
		const cell = getCell(ignoreFocus);
		const isSameValue = isSame(getValue($$props.row, $$props.column), $editor().value);

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
			: { row: $editor().id, column: $editor().column };
	}

	function keyHandler(ev) {
		if (ev.key === "Enter" && $editor()) {
			if ($$props.column.editor.type === "multiselect") {
				updateValue($editor().value);
			} else {
				cancel();
			}
		}
	}

	let style = $.derived(() => getStyle($$props.column.width, $$props.column.flexgrow, $$props.column.fixed, $$props.column.left, $$props.column.right));

	const SvelteComponent = $.derived(() => {
		let editor = $$props.column.editor;

		if (typeof editor === "function") editor = editor($$props.row, $$props.column);

		let type = typeof editor === "string" ? editor : editor.type;

		return editors[type];
	});

	var div = root();
	var node = $.child(div);

	$.component(node, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
		SvelteComponent_1($$anchor, {
			get editor() {
				return $editor();
			},
			onsave: save,
			onapply: updateValue,
			oncancel: cancel,
			onaction: ({ action, data }) => api.exec(action, data)
		});
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_style(div, $.get(style));
		$.set_attribute(div, 'role', typeof $$props.row.$parent !== "undefined" ? "gridcell" : "cell");
		$.set_attribute(div, 'aria-readonly', typeof $$props.row.$parent !== "undefined" ? $$props.column.editor ? false : true : undefined);
	});

	$.delegated('click', div, (ev) => ev.stopPropagation());
	$.delegated('dblclick', div, (ev) => ev.stopPropagation());
	$.delegated('keydown', div, keyHandler);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'dblclick', 'keydown']);