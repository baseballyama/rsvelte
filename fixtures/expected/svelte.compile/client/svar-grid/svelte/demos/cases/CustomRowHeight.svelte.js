import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src/";
import { repeatData, getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>DataGrid can have custom row heights</h4> <div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;"><!> <!> <!> <!></div> <div style="height: 510px;"><!></div></div>`);

export default function CustomRowHeight($$anchor, $$props) {
	$.push($$props, true);

	const { columns } = getData();

	const data = repeatData(50).map((row, i) => {
		const hcase = i % 10;

		if (hcase === 2) return { ...row, rowHeight: 50 };
		if (hcase === 5) return { ...row, rowHeight: 75 };
		if (hcase === 7) return { ...row, rowHeight: 100 };

		return row;
	});

	let api = $.state(void 0);

	function doScroll(row) {
		$.get(api).exec("scroll", { row });
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Button(node, {
		type: 'primary',
		onclick: () => doScroll(data[49].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Scroll: last row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		type: 'primary',
		onclick: () => doScroll(data[0].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Scroll: first row');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		type: 'primary',
		onclick: () => doScroll(data[17].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Scroll: row id 18');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		type: 'primary',
		onclick: () => doScroll(data[42].id),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Scroll: row id 43');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	$.bind_this(
		Grid(node_4, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			footer: true,
			reorder: true
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}