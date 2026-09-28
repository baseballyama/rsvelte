import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text, Field, CheckboxGroup, Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div class="navigation svelte-13iihmv"><!> <!> <span> </span></div>`);
var root_1 = $.from_html(`<div class="demo svelte-13iihmv" style="padding: 20px;"><h4>Search Rows in DataGrid</h4> <div style="margin-bottom: 20px;"><div class="search svelte-13iihmv"><div style="width: 400px"><!></div> <!></div> <!></div> <div style="height: 400px;"><!></div></div>`);

export default function SearchRows($$anchor, $$props) {
	$.push($$props, true);

	const $search = () => $.store_get($.get(search), '$search', $$stores);
	const $flatData = () => $.store_get($.get(flatData), '$flatData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { allData: data, countries } = getData();

	const columns = [
		{ id: "id", header: "Id", width: 50 },
		{ id: "firstName", header: "First Name", width: 150 },
		{ id: "lastName", header: "Last Name", width: 150 },
		{ id: "email", header: "Email" },
		{ id: "country", header: "Country", options: countries },
		{ id: "companyName", header: "Company" }
	];

	const options = columns.map((col) => ({ id: col.id, label: col.header }));
	let api = $.state(void 0);
	let searchValue = $.state("");
	let searchColumns = $.state($.proxy([]));
	let search = $.state(void 0);
	let flatData = $.state(void 0);
	let currentSearchIndex = $.state(-1);
	let currentRowId = $.state(null);
	let searchRows = $.derived(() => Object.keys($search().rows));

	function searchByText({ value }) {
		$.set(searchValue, value, true);
		doSearch();
	}

	function searchByColumns({ value }) {
		$.set(searchColumns, value, true);
		doSearch();
	}

	function doSearch() {
		const searchParams = { search: $.get(searchValue) };

		if ($.get(searchColumns).length) {
			const columns = {};

			$.get(searchColumns).forEach((col) => columns[col] = true);
			searchParams.columns = columns;
		}

		$.get(api).exec("search-rows", searchParams);
		$.set(currentSearchIndex, -1);
		$.set(sortedRows, $.set(currentRowId, null), true);
	}

	function init(obj) {
		$.set(api, obj, true);

		const rState = $.get(api).getReactiveState();

		$.store_unsub($.set(search, rState.search, true), '$search', $$stores);
		$.store_unsub($.set(flatData, rState.flatData, true), '$flatData', $$stores);
	}

	function showPrev() {
		$.set(currentSearchIndex, $.get(currentSearchIndex) - 1);
		navigateToRow();
	}

	function showNext() {
		$.set(currentSearchIndex, $.get(currentSearchIndex) + 1);
		navigateToRow();
	}

	let sortedRows = $.state(null);

	function navigateToRow() {
		if (!$.get(sortedRows)) $.set(sortedRows, $flatData().filter((r) => $.get(searchRows).includes(r.id + "")).map((r) => r.id), true);

		$.set(currentRowId, $.get(sortedRows)[$.get(currentSearchIndex)], true);

		// scroll to the current search result row
		$.get(api).exec("scroll", { row: $.get(currentRowId) });
	}

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Text(node, {
		get value() {
			return $.get(searchValue);
		},
		placeholder: 'Enter search value...',
		icon: 'wxi-search',
		clear: true,
		onchange: searchByText
	});

	$.reset(div_3);

	var node_1 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var node_2 = $.child(div_4);

			{
				let $0 = $.derived(() => $.get(currentSearchIndex) === -1);

				Button(node_2, {
					text: 'Previous',
					onclick: showPrev,
					get disabled() {
						return $.get($0);
					}
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => $.get(currentSearchIndex) === $.get(searchRows).length - 1);

				Button(node_3, {
					text: 'Next',
					onclick: showNext,
					get disabled() {
						return $.get($0);
					}
				});
			}

			var span = $.sibling(node_3, 2);
			var text = $.only_child(span);

			$.reset(div_4);
			$.template_effect(() => $.set_text(text, `${$.get(currentSearchIndex) + 1}/${$.get(searchRows).length ?? ''} (rows matches)`));
			$.append($$anchor, div_4);
		};

		var d = $.derived(() => $search()?.value?.trim());

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	Field(node_4, {
		label: 'Columns:',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			CheckboxGroup($$anchor, {
				get options() {
					return options;
				},

				get value() {
					return $.get(searchColumns);
				},
				type: 'inline',
				onchange: searchByColumns
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var node_5 = $.child(div_5);

	Grid(node_5, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		init,
		rowStyle: (row) => $.get(currentRowId) == row.id ? "search-highlight" : ""
	});

	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}