import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pager } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><!> <div><!></div></div>`);

export default function Paging($$anchor, $$props) {
	$.push($$props, true);

	const { allData, columns } = getData();
	let data = $.state($.proxy([]));

	function setPage(ev) {
		const { from, to } = ev;

		$.set(data, allData.slice(from, to), true);
	}

	setPage({ from: 0, to: 8 });

	var div = root();
	var node = $.child(div);

	Pager(node, {
		get total() {
			return allData.length;
		},
		pageSize: 8,
		onchange: setPage
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Grid(node_1, {
		get data() {
			return $.get(data);
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