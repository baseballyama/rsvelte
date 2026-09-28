import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table, exportJSON, exportCSV, exportTXT, exportSQL } from "@flowbite-svelte-plugins/datatable";
import { Button } from "flowbite-svelte";
import items from "./data/sample.json";

var root = $.from_html(`<!> <div class="mt-4 space-x-2"><!> <!> <!> <!></div>`, 1);

export default function Export($$anchor, $$props) {
	$.push($$props, true);

	let dataTableInstance = $.state(null);

	const getDataTableInstance = () => {
		console.log("dataTableInstance:", $.get(dataTableInstance));

		if ($.get(dataTableInstance)) {
			return $.get(dataTableInstance);
		}

		console.error("DataTable instance not found");

		return null;
	};

	const handleCSV = () => {
		console.log("clicked handleCSV");

		const instance = getDataTableInstance();

		if (instance) {
			try {
				exportCSV(instance, { download: true, lineDelimiter: "\n", columnDelimiter: ";" });
				console.log("CSV export successful");
			} catch(error) {
				console.error("CSV export failed:", error);
			}
		}
	};

	const handleSQL = () => {
		console.log("clicked handleSQL");

		const instance = getDataTableInstance();

		if (instance) {
			try {
				exportSQL(instance, { download: true, tableName: "export_table" });
				console.log("SQL export successful");
			} catch(error) {
				console.error("SQL export failed:", error);
			}
		}
	};

	const handleTXT = () => {
		console.log("clicked handleTXT");

		const instance = getDataTableInstance();

		if (instance) {
			try {
				exportTXT(instance, { download: true });
				console.log("TXT export successful");
			} catch(error) {
				console.error("TXT export failed:", error);
			}
		}
	};

	const handleJSON = () => {
		console.log("clicked handleJSON");

		const instance = getDataTableInstance();

		if (instance) {
			try {
				exportJSON(instance, { download: true, space: 3 });
				console.log("JSON export successful");
			} catch(error) {
				console.error("JSON export failed:", error);
			}
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Table(node, {
		get items() {
			return items;
		},

		get dataTableInstance() {
			return $.get(dataTableInstance);
		},

		set dataTableInstance($$value) {
			$.set(dataTableInstance, $$value, true);
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		onclick: handleCSV,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Export CSV');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: handleSQL,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Export SQL');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: handleTXT,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Export TXT');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: handleJSON,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Export JSON');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}