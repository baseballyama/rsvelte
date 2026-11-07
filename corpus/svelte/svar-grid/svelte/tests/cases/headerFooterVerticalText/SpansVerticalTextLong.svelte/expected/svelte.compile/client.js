import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../../data";
import { Grid } from "../../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo svelte-19uo3vq" style="padding: 20px;"><div style="margin-top: 20px;"><!></div></div>`);

export default function SpansVerticalTextLong($$anchor, $$props) {
	$.push($$props, true);

	const tmp = getData(), data = $.proxy(tmp.data);

	data.length = 5;

	const columns = [
		{ id: "id", width: 50 },
		{
			id: "firstName",
			header: [
				{ text: "Main client info", colspan: 5 },
				{ text: "User", colspan: 2 },
				{ text: "First Name", vertical: true }
			],
			footer: [
				{ text: "Main client info", colspan: 3 },
				{ text: "User", colspan: 2 },
				{ text: "First Name", vertical: true }
			],
			width: 150
		},

		{
			id: "lastName",
			header: ["", "", { text: "Last Name", vertical: true }],
			footer: ["", "", { text: "Last Name", vertical: true }],
			width: 150
		},

		{
			id: "email",
			header: [
				"",
				{ text: "Email with long text", vertical: true, rowspan: 2 }
			],
			footer: [
				"",
				{ text: "Email with long text", vertical: true, rowspan: 2 }
			]
		},

		{
			id: "companyName",
			header: ["", { text: "Company", colspan: 2 }, { text: "Name" }],
			footer: [
				{
					text: "Company long text",
					colspan: 2,
					rowspan: 2,
					vertical: true
				},
				{ text: "Name" }
			]
		},

		{
			id: "city",
			width: 100,
			header: ["", "", "City"],
			footer: ["", "City"]
		},

		{
			id: "stars",
			header: { text: "Stars with long long text", vertical: true },
			footer: { text: "Stars with long long text", vertical: true },
			width: 50
		},

		{
			id: "date",
			template: (obj) => obj.toDateString(),
			header: "Joined",
			footer: "Joined"
		}
	];

	let api = $.state(void 0);

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					$.bind_this(
						Grid(node, {
							get data() {
								return data;
							},

							get columns() {
								return columns;
							},
							footer: true
						}),
						($$value) => $.set(api, $$value, true),
						() => $.get(api)
					);

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