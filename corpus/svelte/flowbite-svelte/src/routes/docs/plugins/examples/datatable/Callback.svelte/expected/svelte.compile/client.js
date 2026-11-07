import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Callback($$anchor) {
	let isTableLoading = $.state(true);
	let tableInstance = $.state(null);

	function handleInitStart() {
		console.log("Table initialization started");
		$.set(isTableLoading, true);
	}

	function handleInitComplete(dataTable) {
		console.log("Table ready:", dataTable);
		$.set(isTableLoading, false);
	}

	function handleInitError(error) {
		console.error("Table initialization failed:", error);
		$.set(isTableLoading, false);
	}

	function handleSort(column, direction) {
		console.log(`Column ${column} sorted ${direction}`);
	}

	function handleSearch(query, matched) {
		console.log(`Search: "${query}" found ${matched.length} results`);
	}

	function handleRowSelect(rowIndex) {
		console.log(`Row ${rowIndex} selected`);
	}

	const selectRowsOptions = {
		rowRender: (row, tr, _index) => {
			if (!tr.attributes) {
				tr.attributes = {};
			}

			if (!tr.attributes.class) {
				tr.attributes.class = "";
			}

			if (row.selected) {
				tr.attributes.class += " selected";
			} else {
				tr.attributes.class = tr.attributes.class.replace(" selected", "");
			}

			return tr;
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(isTableLoading)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Table(node_1, {
		get items() {
			return items;
		},
		onInitStart: handleInitStart,
		onInitComplete: handleInitComplete,
		onInitError: handleInitError,
		onSort: handleSort,
		onSearch: handleSearch,
		onSelectRow: handleRowSelect,
		selectable: true,
		get dataTableOptions() {
			return selectRowsOptions;
		},

		get isLoading() {
			return $.get(isTableLoading);
		},

		set isLoading($$value) {
			$.set(isTableLoading, $$value, true);
		},

		get dataTableInstance() {
			return $.get(tableInstance);
		},

		set dataTableInstance($$value) {
			$.set(tableInstance, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}