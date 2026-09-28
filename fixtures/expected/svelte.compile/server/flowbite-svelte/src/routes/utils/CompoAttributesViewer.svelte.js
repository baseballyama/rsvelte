import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { getFilteredFileNames } from "./helpers";
import JSONView from "./JSONView.svelte";

export default function CompoAttributesViewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dirName = "", components, plugin } = $$props;
		let compoData = [];

		// default is find fileName using dirName
		const fileNames = $.derived(() => getFilteredFileNames(dirName));

		// if components are given (e.g. checkbox, etc in forms, typography, utils)
		// use the components string
		let componentArray = $.derived(() => components ? components.split(", ") : []);

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		let importPromises = [];

		let chartData = null;
		let dataTableData = null;
		let loading = true;
		let error = null;

		onMount(async () => {
			try {
				loading = true;

				const [chartResponse, tableResponse] = await Promise.all([
					fetch("https://raw.githubusercontent.com/shinokada/flowbite-svelte-plugins/main/apps/flowbite-svelte-chart/src/routes/component-data/Chart.json"),
					fetch("https://raw.githubusercontent.com/shinokada/flowbite-svelte-plugins/main/apps/flowbite-svelte-datatable/src/routes/component-data/Table.json")
				]);

				if (!chartResponse.ok || !tableResponse.ok) {
					throw new Error("Failed to fetch one or more data sources");
				}

				[chartData, dataTableData] = await Promise.all([chartResponse.json(), tableResponse.json()]);
				error = null;
			} catch(err) {
				error = err instanceof Error ? err.message : "An unknown error occurred";
			} finally {
				loading = false;
			}
		});

		async function processComponents() {
			if (componentArray().length > 0) {
				importPromises = componentArray().map(async (component) => {
					const module = await import(`../component-data/${component}.json`);

					return { data: module };
				});
			} else if (plugin === "chart" && chartData) {
				importPromises = [Promise.resolve({ data: chartData })];
			} else if (plugin === "dataTable" && dataTableData) {
				importPromises = [Promise.resolve({ data: dataTableData })];
			} else {
				importPromises = fileNames().map(async (component) => {
					const module = await import(`../component-data/${component}.json`);

					return { data: module };
				});
			}

			try {
				compoData = await Promise.all(importPromises);
			} catch(error) {
				console.error("Error:", error);

				throw error;
			}
		}

		onMount(() => {
			processComponents().catch((error) => {
				console.error("Error outside of processComponents:", error);
			});
		});

		if (loading) {
			$$renderer.push(`<!--[0--><div>Loading...</div>`);
		} else if (error) {
			$$renderer.push(`<!--[1--><div class="text-red-600 dark:text-red-400">Error: ${$.escape(error)}</div>`);
		} else if (compoData) {
			$$renderer.push(`<!--[2--><div id="compoData"><!--[-->`);

			const each_array = $.ensure_array_like(compoData);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let compo = each_array[$$index];

				JSONView($$renderer, { data: compo.data.default });
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}