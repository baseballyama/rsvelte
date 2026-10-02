import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from "@svar-ui/svelte-core";
import { FilterBar, createFilter, getOptions } from "@svar-ui/svelte-filter";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Filter grid data executing "filter-rows" action</h4> <!> <!> <!></div>`);

export default function FilterBar_1($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();
	let api = $.state(void 0);
	let filterId = $.state(1);

	const filterTabs = [
		{ id: 1, label: "By all" },
		{ id: 2, label: "By city" },
		{ id: 3, label: "By the field" }
	];

	const cities = getOptions(data, "city");

	function handleValueChange({ value }) {
		const filter = createFilter(value);

		$.get(api).exec("filter-rows", { filter });
	}

	function handleFilterChange({ value }) {
		$.set(filterId, value, true);
		$.get(api).exec("filter-rows", { filter: null });
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	Tabs(node, {
		get value() {
			return $.get(filterId);
		},

		get options() {
			return filterTabs;
		},
		onchange: handleFilterChange
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			FilterBar($$anchor, {
				fields: [
					{
						type: "all",
						by: ["id", "city", "firstName", "lastName", "email"]
					}
				],
				onchange: handleValueChange
			});
		};

		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => [{ type: "text", id: "city", options: cities }]);

				FilterBar($$anchor, {
					get fields() {
						return $.get($0);
					},
					onchange: handleValueChange
				});
			}
		};

		var consequent_2 = ($$anchor) => {
			FilterBar($$anchor, {
				fields: [
					{
						type: "dynamic",
						by: ["city", "firstName", "lastName", "email"]
					}
				],
				onchange: handleValueChange
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(filterId) === 1) $$render(consequent); else if ($.get(filterId) === 2) $$render(consequent_1, 1); else if ($.get(filterId) === 3) $$render(consequent_2, 2);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.bind_this(
		Grid(node_2, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			}
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}