import * as $ from 'svelte/internal/server';
import { Table, exportJSON, exportCSV, exportTXT, exportSQL } from "@flowbite-svelte-plugins/datatable";
import { Button } from "flowbite-svelte";
import items from "./data/sample.json";

export default function Export($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dataTableInstance = null;

		const getDataTableInstance = () => {
			console.log("dataTableInstance:", dataTableInstance);

			if (dataTableInstance) {
				return dataTableInstance;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Table($$renderer, {
				items,
				get dataTableInstance() {
					return dataTableInstance;
				},

				set dataTableInstance($$value) {
					dataTableInstance = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="mt-4 space-x-2">`);

			Button($$renderer, {
				onclick: handleCSV,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Export CSV`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: handleSQL,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Export SQL`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: handleTXT,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Export TXT`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: handleJSON,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Export JSON`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}