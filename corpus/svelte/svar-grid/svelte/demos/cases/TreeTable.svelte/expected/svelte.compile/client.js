import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><div class="toolbar svelte-51cyyt"><!> <!></div> <div><!></div></div>`);

export default function TreeTable($$anchor, $$props) {
	$.push($$props, true);

	const { treeData, treeColumns } = getData();
	let api = $.state(void 0);

	function openAll() {
		$.get(api).exec("open-row", { id: 0, nested: true });
	}

	function closeAll() {
		$.get(api).exec("close-row", { id: 0, nested: true });
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		type: 'primary',
		onclick: () => openAll(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open all');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		type: 'primary',
		onclick: () => closeAll(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Close all');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	$.bind_this(
		Grid(node_2, {
			tree: true,
			get data() {
				return treeData;
			},

			get columns() {
				return treeColumns;
			},
			footer: true
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}