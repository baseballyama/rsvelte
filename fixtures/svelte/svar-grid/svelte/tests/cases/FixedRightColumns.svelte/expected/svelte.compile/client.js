import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Slider } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div class="demo svelte-1g8xwz" style="padding: 20px;"><h4>Drag the slider to fix columns on the right</h4> <div class="controls svelte-1g8xwz"><!></div> <div style="max-width: 800px;"><!></div> <h4>Grid with fixed columns on the left and on the right</h4> <div style="max-width: 800px;"><!></div> <h4>Grid with multiline header and fixed columns on the right</h4> <div style="max-width: 800px;"><!></div></div>`);

export default function FixedRightColumns($$anchor, $$props) {
	$.push($$props, true);

	const { data, allColumns: columns } = getData();
	let right = $.state(2);

	const columnsSpans = [
		{
			id: "id",
			width: 50,
			footer: { text: "All users", colspan: 6 }
		},

		{
			id: "firstName",
			header: [
				{ text: "Main client info", colspan: 3, collapsible: true },
				{ text: "First Name" }
			],
			width: 150,
			resize: true,
			sort: true
		},

		{
			id: "lastName",
			header: ["", "Last Name"],
			width: 150,
			resize: true,
			sort: true
		},

		{
			id: "email",
			header: ["", "Email"],
			width: 250,
			resize: true,
			sort: true
		},

		{
			id: "companyName",
			header: [
				{ text: "Company", colspan: 2, collapsible: true },
				{ text: "Name" }
			],
			width: 200,
			resize: true,
			sort: true
		},
		{ id: "city", width: 200, header: ["", "City"] },
		{
			id: "followers",
			header: [{ text: "Stats", colspan: 2 }, { text: "Folowers" }],
			footer: { text: data.length, colspan: 3, css: "right" },
			resize: true,
			width: 100
		},

		{
			id: "stars",
			header: ["", "Stars"],
			width: 100,
			resize: true,
			footer: { text: "10" }
		},

		{
			id: "date",
			template: (obj) => obj.toDateString(),
			header: "Joined",
			footer: { text: "" }
		}
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Field(node, {
		label: 'Fix columns',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				min: 0,
				max: 4,
				get value() {
					return $.get(right);
				},

				set value($$value) {
					$.set(right, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => ({ right: $.get(right) }));

		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},

			get split() {
				return $.get($0);
			}
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var node_2 = $.child(div_3);

	Grid(node_2, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		split: { left: 2, right: 2 }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 4);
	var node_3 = $.child(div_4);

	Grid(node_3, {
		get data() {
			return data;
		},

		get columns() {
			return columnsSpans;
		},
		footer: true,
		split: { right: 3 }
	});

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}