import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div class="demo svelte-1wuh3lt" style="padding: 20px;"><div><!></div> <div style="margin-top: 20px;"><!></div></div>`);

export default function TableHeaderFooterVertical($$anchor, $$props) {
	$.push($$props, true);

	const tmp = getData(),
		data = $.proxy(tmp.data),
		columns = $.proxy(tmp.columnsVertical),
		scolumns = $.proxy(tmp.columnsSpansVertical);

	data.length = 5;

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

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Grid(node_1, {
		get data() {
			return data;
		},

		get columns() {
			return scolumns;
		},
		footer: true
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}