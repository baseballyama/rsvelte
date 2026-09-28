import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getOptions } from "@svar-ui/query-store";
import { Query, createArrayFilter } from "@svar-ui/svelte-query";
import { Willow, Locale } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><div><!> <!></div></div>`);

export default function FilterQuery($$anchor, $$props) {
	$.push($$props, true);

	const $cols = () => $.store_get($.get(cols), '$cols', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, columns } = getData();
	let filteredData = $.state($.proxy(data));

	function applyFilter(value) {
		const filter = createArrayFilter(value);

		$.set(filteredData, filter(data), true);
	}

	let options = $.proxy({});
	let fields = $.state($.proxy([]));
	let cols = $.state(void 0);
	let api = $.state(void 0);

	function getLabel(col) {
		if (col.header) {
			if (typeof col.header === "string") return col.header;

			if (col.header.length) for (let i = col.header.length - 1; i >= 0; i--) {
				const text = col.header[i].text;

				if (text) return text;
				if (col.header[i] && typeof col.header[i] === "string") return col.header[i];
			} else if (col.header.text) return col.header.text;
		}

		return col.id;
	}

	function init(api) {
		$.set(fields, [], true);
		$.store_unsub($.set(cols, api.getReactiveState().columns, true), '$cols', $$stores);

		$cols().forEach((col) => {
			if (col.id !== "id") {
				options[col.id] = getOptions(data, col.id);
				$.get(fields).push({ id: col.id, name: getLabel(col), type: "text" });
			}
		});
	}

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					Query(node, {
						get fields() {
							return $.get(fields);
						},

						get options() {
							return options;
						},
						type: "line",
						onchange: (ev) => applyFilter(ev.value)
					});

					var node_1 = $.sibling(node, 2);

					$.bind_this(
						Grid(node_1, {
							get data() {
								return $.get(filteredData);
							},

							get columns() {
								return columns;
							},
							init
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
	$$cleanup();
}