import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo svelte-1jkthzh" style="padding: 20px;"><div><!></div></div>`);

export default function TableHeaderFooterSpans($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{
			id: "firstName",
			header: [{ text: "User", colspan: 2 }, { text: "First Name" }],
			footer: [
				{ text: "First Name", rowspan: 2 },
				{ text: "User", colspan: 2 }
			],
			width: 150,
			resize: true
		},

		{
			id: "lastName",
			header: ["", "Last Name"],
			footer: [{ text: "Last Name", rowspan: 2 }, ""],
			width: 150
		},

		{
			id: "email",
			header: [{ text: "Email", rowspan: 2, css: "center" }, "Second line"],
			footer: ["Second line", { text: "Email", rowspan: 2, css: "center" }]
		},

		{
			id: "companyName",
			header: [
				{ text: "Company", colspan: 2, css: "center" },
				{ text: "Name" }
			],
			footer: [
				{ text: "Name", rowspan: 2 },
				{ text: "Company", colspan: 2, css: "center" }
			]

			// flexgrow: 1
		},

		{
			id: "city",
			width: 100,
			// flexgrow: 1,
			header: ["", "City"],
			footer: [{ text: "City", rowspan: 2 }, ""]
		},
		{ id: "stars", header: "Stars", footer: "Stars" },
		{
			id: "date",
			header: ["Some", "Header", "Lines"],
			footer: ["Lines", "Footer", "Some"]
		}
	];

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					Grid(node, {
						get data() {
							return data;
						},

						get columns() {
							return columns;
						},
						footer: true
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