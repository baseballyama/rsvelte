import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;"><!> <!> <!></div> <div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;"><!> <!> <!></div> <div style="width: 1000px; height: 600px;"><!></div></div>`);

export default function ScrollTable($$anchor, $$props) {
	$.push($$props, true);

	const data = repeatData(1000);
	const columns = repeatColumns(100);
	let api = $.state(void 0);

	function doScroll(row, column) {
		$.get(api).exec("scroll", { row, column });
	}

	function doScrollTo(top, left) {
		$.get(api).exec("scroll-to", { top, left });
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		type: 'primary',
		onclick: () => doScroll(data[999].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Scroll to the last row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		type: 'primary',
		onclick: () => doScroll(null, columns[99].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Scroll to the last column');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		type: 'primary',
		onclick: () => doScroll(data[0].id, columns[1].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Scroll to the first row and column');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	Button(node_3, {
		type: 'primary',
		onclick: () => doScrollTo(5000, 0),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Scroll to top: 5000');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		type: 'primary',
		onclick: () => doScrollTo(0, 2000),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Scroll to left: 2000');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		type: 'primary',
		onclick: () => doScrollTo(0, 0),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Scroll to top-left corner');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	$.bind_this(
		Grid(node_6, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			split: { left: 1 }
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}