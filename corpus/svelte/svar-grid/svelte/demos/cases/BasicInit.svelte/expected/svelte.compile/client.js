import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><div><!></div></div>`);

export default function BasicInit($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}