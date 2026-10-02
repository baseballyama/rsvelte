import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, ContextMenu, HeaderMenu } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><h4>Context menu with default actions</h4> <!></div>`);

export default function ContextMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const { data, flexibleColumns: columns } = getData();
	let grid = $.state(void 0);
	var div = root();
	var node = $.sibling($.child(div), 2);

	ContextMenu(node, {
		get api() {
			return $.get(grid);
		},

		children: ($$anchor, $$slotProps) => {
			HeaderMenu($$anchor, {
				get api() {
					return $.get(grid);
				},

				children: ($$anchor, $$slotProps) => {
					$.bind_this(
						Grid($$anchor, {
							get data() {
								return data;
							},

							get columns() {
								return columns;
							},
							multiselect: true,
							reorder: true
						}),
						($$value) => $.set(grid, $$value, true),
						() => $.get(grid)
					);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}