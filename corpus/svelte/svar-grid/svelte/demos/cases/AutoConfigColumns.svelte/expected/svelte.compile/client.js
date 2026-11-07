import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><div style="height: 620px; max-width: 800px;"><!></div></div>`);

export default function AutoConfigColumns($$anchor, $$props) {
	$.push($$props, true);

	const { allData } = getData();
	const config = { editor: "text" };
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return allData;
		},

		get autoConfig() {
			return config;
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}