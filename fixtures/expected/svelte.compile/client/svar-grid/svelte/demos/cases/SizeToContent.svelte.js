import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 1 row )</h4> <!></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 1 row, flexible column widths )</h4> <!></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 10 rows )</h4> <!></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( multiple rows )</h4> <!></div>`, 1);

export default function SizeToContent($$anchor, $$props) {
	$.push($$props, true);

	const { data, allColumns } = getData();
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	{
		let $0 = $.derived(() => data.slice(0, 1));
		let $1 = $.derived(() => allColumns.slice(0, 3));

		Grid(node, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return $.get($1);
			}
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	{
		let $0 = $.derived(() => data.slice(0, 1));

		Grid(node_1, {
			get data() {
				return $.get($0);
			},
			header: false,
			columns: [
				{ id: "id", width: 40 },
				{ id: "city", flexgrow: 1 },
				{ id: "email", flexgrow: 1 }
			]
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	{
		let $0 = $.derived(() => data.slice(0, 10));
		let $1 = $.derived(() => allColumns.slice(0, 5));

		Grid(node_2, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return $.get($1);
			}
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.sibling($.child(div_3), 2);

	Grid(node_3, {
		get data() {
			return data;
		},

		get columns() {
			return allColumns;
		}
	});

	$.reset(div_3);
	$.append($$anchor, fragment);
	$.pop();
}