import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, Pagination } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DataTablePagination($$anchor, $$props) {
	$.push($$props, true);

	let rows = Array.from({ length: 10 }).map((_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		protocol: "HTTP",
		port: 3000 + i * 10,
		rule: i % 2 ? "Round robin" : "DNS delegation"
	}));

	let pageSize = 5;
	let page = 1;
	var fragment = root();
	var node = $.first_child(fragment);

	DataTable(node, {
		sortable: true,
		title: 'Load balancers',
		description: 'Your organization\'s active load balancers.',
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "port", value: "Port" },
			{ key: "rule", value: "Rule" }
		],

		get pageSize() {
			return pageSize;
		},

		get page() {
			return page;
		},

		get rows() {
			return rows;
		}
	});

	var node_1 = $.sibling(node, 2);

	Pagination(node_1, {
		get totalItems() {
			return rows.length;
		},
		pageSizeInputDisabled: true,
		get pageSize() {
			return pageSize;
		},

		set pageSize($$value) {
			pageSize = $$value;
		},

		get page() {
			return page;
		},

		set page($$value) {
			page = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}