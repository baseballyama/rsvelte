import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, ContextMenu } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px;"><div><!></div></div>`);

export default function ContextMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name", flexgrow: 1 },
		{ id: "companyName", header: "Company", flexgrow: 1 }
	];

	let table = $.state(void 0);

	function init(api) {
		$.set(table, api, true);
	}

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					ContextMenu(node, {
						get api() {
							return $.get(table);
						},

						children: ($$anchor, $$slotProps) => {
							Grid($$anchor, {
								get data() {
									return data;
								},

								get columns() {
									return columns;
								},
								init,
								reorder: true,
								multiselect: true
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}