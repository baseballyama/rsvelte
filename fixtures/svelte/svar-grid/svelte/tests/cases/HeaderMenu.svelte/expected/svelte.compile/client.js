import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px;"><div><!></div></div>`);

export default function HeaderMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name", flexgrow: 1 },
		{ id: "companyName", header: "Company", flexgrow: 1 }
	];

	let api = $.state(void 0);

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					HeaderMenu(node, {
						columns: { city: true, firstName: true, id: true },
						get api() {
							return $.get(api);
						},

						children: ($$anchor, $$slotProps) => {
							$.bind_this(
								Grid($$anchor, {
									get data() {
										return data;
									},

									get columns() {
										return columns;
									}
								}),
								($$value) => $.set(api, $$value, true),
								() => $.get(api)
							);
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