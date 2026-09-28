import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { repeatColumns, repeatData } from "../data";
import { Grid } from "../../src/";

var root = $.from_html(`<div class="bar svelte-o6efzn"><!> <!></div> <div class="demo svelte-o6efzn"><!></div>`, 1);

export default function MultilineRows($$anchor, $$props) {
	$.push($$props, true);

	function addRow() {
		$.get(api).exec("add-row", { row: {} });
	}

	function deleteRow() {
		const id = $.get(api).getState().selectedRows[0];

		if (id) {
			$.get(api).exec("delete-row", { id });
		}
	}

	let api = $.state(void 0);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: addRow,
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: deleteRow,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Delete Row');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	{
		let $0 = $.derived(() => repeatData(60));
		let $1 = $.derived(() => repeatColumns(15).map((c) => ({ ...c, resize: true, editor: "text" })));

		$.bind_this(
			Grid(node_2, {
				autoRowHeight: true,
				get data() {
					return $.get($0);
				},

				get columns() {
					return $.get($1);
				},
				footer: true,
				split: { left: 2 }
			}),
			($$value) => $.set(api, $$value, true),
			() => $.get(api)
		);
	}

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}