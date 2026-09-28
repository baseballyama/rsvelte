import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import Overlay from "../custom/Overlay.svelte";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Overlay as a text</h4> <div><!></div> <h4>Overlay as a component</h4> <div><!></div></div>`);

export default function Overlay_1($$anchor, $$props) {
	$.push($$props, true);

	const { columns, data } = getData();
	let showOverlay = $.state(true);

	function showData({ show }) {
		if (show) $.set(showOverlay, false);
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => data.slice(0, 5));

		Grid(node, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return columns;
			},
			overlay: "Loading...",
			footer: true
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(showOverlay) ? Overlay : null);

		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},

			get overlay() {
				return $.get($0);
			},
			footer: true,
			onoverlaybuttonclick: showData
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}