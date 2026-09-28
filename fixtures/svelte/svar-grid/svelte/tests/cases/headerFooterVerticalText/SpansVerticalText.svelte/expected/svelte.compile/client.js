import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../../data";
import { Grid } from "../../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo svelte-1l9cqfc" style="padding: 20px;"><div style="margin-top: 20px;"><!></div></div>`);

export default function SpansVerticalText($$anchor, $$props) {
	$.push($$props, true);

	const tmp = getData(),
		data = $.proxy(tmp.data),
		columns = $.proxy(tmp.columnsSpansVertical);

	data.length = 5;

	let api = $.state(void 0);

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					$.bind_this(
						Grid(node, {
							get data() {
								return data;
							},

							get columns() {
								return columns;
							},
							footer: true
						}),
						($$value) => $.set(api, $$value, true),
						() => $.get(api)
					);

					$.reset(div_1);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}