import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, registerMenuItem } from "@svar-ui/svelte-menu";
import HeaderMenuItem from "./HeaderMenuItem.svelte";

export default function HeaderMenu($$anchor, $$props) {
	$.push($$props, true);

	const $rColumns = () => $.store_get(rColumns, '$rColumns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let columns = $.prop($$props, 'columns', 3, null);

	registerMenuItem("table-header", HeaderMenuItem);

	function getLabel(col) {
		for (let i = col.header.length - 1; i >= 0; i--) {
			const text = col.header[i].text;

			if (text) return text;
		}

		return col.id;
	}

	function headerMenuClick(e) {
		const col = e.action;

		if (col) {
			$$props.api.exec("hide-column", { id: col.id, mode: !col.hidden });
		}
	}

	function open(id) {
		return id;
	}

	let rColumns;

	const headerMenuOptions = $.derived(() => {
		if ($$props.api) {
			rColumns = $$props.api.getReactiveState()._columns;

			const included = columns()
				? $rColumns().filter((c) => columns()[c.id])
				: $rColumns();

			return included.map((c) => {
				const text = getLabel(c);

				return { id: c.id, text, type: "table-header", hidden: c.hidden };
			});
		} else {
			return [];
		}
	});

	ContextMenu($$anchor, {
		dataKey: 'headerId',
		get options() {
			return $.get(headerMenuOptions);
		},
		onclick: headerMenuClick,
		at: 'point',
		resolver: open,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}