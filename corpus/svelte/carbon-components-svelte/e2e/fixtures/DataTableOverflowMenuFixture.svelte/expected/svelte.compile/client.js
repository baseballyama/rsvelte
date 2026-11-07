import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
import { tick } from "svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="controls svelte-be61tk"><button type="button" data-testid="open-all-menus">Open all menus</button> <button type="button" data-testid="close-all-menus">Close all menus</button></div> <div data-testid="data-table-overflow"><!></div>`, 1);

export default function DataTableOverflowMenuFixture($$anchor, $$props) {
	$.push($$props, true);

	const ROW_COUNT = 50;

	const headers = [
		{ key: "name", value: "Name" },
		{ key: "overflow", empty: true, width: "72px" }
	];

	const rows = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: `row-${i}`, name: `Row ${i}` }));

	/** @type {boolean[]} */
	let openStates = rows.map(() => false);

	async function setAllOpen(open) {
		for (let i = 0; i < ROW_COUNT; i++) openStates[i] = open;

		openStates = openStates;
		await tick();
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	DataTable(node, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		$$slots: {
			cell: ($$anchor, $$slotProps) => {
				const cell = $.derived(() => $$slotProps.cell);
				const rowIndex = $.derived(() => $$slotProps.rowIndex);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						OverflowMenu($$anchor, {
							portalMenu: true,
							flipped: true,
							get open() {
								return openStates[$.get(rowIndex)];
							},

							set open($$value) {
								openStates[$.get(rowIndex)] = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								OverflowMenuItem(node_2, { text: 'Edit' });

								var node_3 = $.sibling(node_2, 2);

								OverflowMenuItem(node_3, { text: 'Delete', danger: true });
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(cell).value));
						$.append($$anchor, text);
					};

					$.if(node_1, ($$render) => {
						if ($.get(cell).key === "overflow") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.reset(div_1);

	$.event('click', button, (event) => {
		event.stopPropagation();
		setAllOpen(true);
	});

	$.event('click', button_1, (event) => {
		event.stopPropagation();
		setAllOpen(false);
	});

	$.append($$anchor, fragment);
	$.pop();
}