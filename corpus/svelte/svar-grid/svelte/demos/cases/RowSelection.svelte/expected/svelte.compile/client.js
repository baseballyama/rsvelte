import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4> </h4> <div><!></div></div>`);

export default function RowSelection($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160 },
		{ id: "firstName", header: "First Name" },
		{ id: "lastName", header: "Last Name" },
		{ id: "companyName", header: "Company" }
	];

	let api = $.state(void 0);
	let s = $.state(0);
	const updateSelected = () => $.set(s, $.get(api).getState().selectedRows, true);
	var div = root();
	var h4 = $.child(div);
	var text = $.only_child(h4);
	var div_1 = $.sibling(h4, 2);
	var node = $.child(div_1);

	$.bind_this(
		Grid(node, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			onselectrow: updateSelected
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => $.set_text(text, `Click on any cell to select. Selected:
		${$0 ?? ''}`),
		[() => $.get(s).length ? $.get(s).join(", ") : "none"]
	);

	$.append($$anchor, div);
	$.pop();
}