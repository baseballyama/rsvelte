import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Willow, Locale, Tabs } from "@svar-ui/svelte-core";
import { FilterBar, createArrayFilter } from "@svar-ui/svelte-query";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><!> <!> <!></div>`);

export default function FilterBar_1($$anchor, $$props) {
	$.push($$props, true);

	const $cols = () => $.store_get($.get(cols), '$cols', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, columns } = getData();
	let fields = $.state(void 0);
	let cols = $.state(void 0);
	let api = $.state(void 0);

	function init(api) {
		$.set(fields, [], true);
		$.store_unsub($.set(cols, api.getReactiveState().columns, true), '$cols', $$stores);

		$cols().forEach((col) => {
			if (col.id !== "id") {
				$.get(fields).push(col.id);
			}
		});
	}

	const filteredData = $.derived(() => createArrayFilter($.get(value))(data));
	let value = $.state(void 0);
	let filter = $.state(1);

	let filterTabs1 = [
		{ id: 1, label: "By all" },
		{ id: 2, label: "By city" },
		{ id: 3, label: "By the field" }
	];

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Tabs(node, {
						get options() {
							return filterTabs1;
						},

						get value() {
							return $.get(filter);
						},

						set value($$value) {
							$.set(filter, $$value, true);
						}
					});

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							FilterBar($$anchor, {
								get fields() {
									return $.get(fields);
								},
								onchange: (ev) => $.set(value, ev.value, true)
							});
						};

						var consequent_1 = ($$anchor) => {
							FilterBar($$anchor, { by: "city", onchange: (ev) => $.set(value, ev.value, true) });
						};

						var consequent_2 = ($$anchor) => {
							FilterBar($$anchor, {
								by: ':dynamic',
								fields: ["city", "firstName", "lastName", "email"],
								onchange: (ev) => $.set(value, ev.value, true)
							});
						};

						$.if(node_1, ($$render) => {
							if ($.get(filter) === 1 && $.get(fields)) $$render(consequent); else if ($.get(filter) === 2) $$render(consequent_1, 1); else if ($.get(filter) === 3) $$render(consequent_2, 2);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					$.bind_this(
						Grid(node_2, {
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