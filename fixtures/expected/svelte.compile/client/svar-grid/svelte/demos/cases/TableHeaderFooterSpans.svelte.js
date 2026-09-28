import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";

var root = $.from_html(`<div class="demo svelte-1dxi0as" style="padding: 20px;"><div><!></div></div>`);

export default function TableHeaderFooterSpans($$anchor, $$props) {
	$.push($$props, true);

	const { data, columnsSpans } = getData();
	let api = $.state(void 0);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	HeaderMenu(node, {
		get api() {
			return $.get(api);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Grid($$anchor, {
					get data() {
						return data;
					},

					get columns() {
						return columnsSpans;
					},
					footer: true
				}),
				($$value) => $.set(api, $$value, true),
				() => $.get(api)
			);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}