import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div class="demo" style="padding: 20px;"><div style="height: 510px;"><!></div></div> <div class="demo" style="padding: 20px;"><div><!></div></div>`, 1);

export default function CollapsibleColumns($$anchor, $$props) {
	$.push($$props, true);

	const { data, allData, collapsibleColumns } = getData();
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(collapsibleColumns);

		Grid(node, {
			get data() {
				return allData;
			},

			get columns() {
				return $.get($0);
			},
			footer: true
		});
	}

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	{
		let $0 = $.derived(() => collapsibleColumns("first"));

		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return $.get($0);
			}
		});
	}

	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}