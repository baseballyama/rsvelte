import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Resizable columns: drag a border between header cells</h4> <div style="max-width: 700px;"><!></div></div>`);

export default function Resize($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50, resize: true },
		{ id: "city", header: "City", flexgrow: 1, resize: true },
		{ id: "email", header: "Email", flexgrow: 2, resize: true },
		{ id: "firstName", header: "First Name", resize: true },
		{ id: "lastName", header: "Last Name", resize: true }
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		split: { left: 2 }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}