import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { getFilteredFileNames } from "./helpers";
import JSONView from "./JSONView.svelte";

var root = $.from_html(`<div>Loading...</div>`);
var root_1 = $.from_html(`<div class="text-red-600 dark:text-red-400"> </div>`);
var root_2 = $.from_html(`<div id="compoData"></div>`);

export default function CompoAttributesViewer($$anchor, $$props) {
	$.push($$props, true);

	let dirName = $.prop($$props, 'dirName', 3, "");
	let compoData = $.state($.proxy([]));

	// default is find fileName using dirName
	const fileNames = $.derived(() => getFilteredFileNames(dirName()));

	// if components are given (e.g. checkbox, etc in forms, typography, utils)
	// use the components string
	let componentArray = $.derived(() => $$props.components ? $$props.components.split(", ") : []);

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	let importPromises = [];

	let chartData = $.state(null);
	let dataTableData = $.state(null);
	let loading = $.state(true);
	let error = $.state(null);

	onMount(async () => {
		try {
			$.set(loading, true);

			const [chartResponse, tableResponse] = await Promise.all([
				fetch("https://raw.githubusercontent.com/shinokada/flowbite-svelte-plugins/main/apps/flowbite-svelte-chart/src/routes/component-data/Chart.json"),
				fetch("https://raw.githubusercontent.com/shinokada/flowbite-svelte-plugins/main/apps/flowbite-svelte-datatable/src/routes/component-data/Table.json")
			]);

			if (!chartResponse.ok || !tableResponse.ok) {
				throw new Error("Failed to fetch one or more data sources");
			}

			await (async ($$value) => {
				var $$array = $.to_array($$value, 2);

				$.set(chartData, $$array[0], true);
				$.set(dataTableData, $$array[1], true);
			})(await Promise.all([chartResponse.json(), tableResponse.json()]));

			$.set(error, null);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : "An unknown error occurred", true);
		} finally {
			$.set(loading, false);
		}
	});

	async function processComponents() {
		if ($.get(componentArray).length > 0) {
			importPromises = $.get(componentArray).map(async (component) => {
				const module = await import(`../component-data/${component}.json`);

				return { data: module };
			});
		} else if ($$props.plugin === "chart" && $.get(chartData)) {
			importPromises = [Promise.resolve({ data: $.get(chartData) })];
		} else if ($$props.plugin === "dataTable" && $.get(dataTableData)) {
			importPromises = [Promise.resolve({ data: $.get(dataTableData) })];
		} else {
			importPromises = $.get(fileNames).map(async (component) => {
				const module = await import(`../component-data/${component}.json`);

				return { data: module };
			});
		}

		try {
			$.set(compoData, await Promise.all(importPromises), true);
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var text = $.only_child(div_1);

			$.template_effect(() => $.set_text(text, `Error: ${$.get(error) ?? ''}`));
			$.append($$anchor, div_1);
		};

		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();

			$.each(div_2, 21, () => $.get(compoData), $.index, ($$anchor, compo) => {
				JSONView($$anchor, {
					get data() {
						return $.get(compo).data.default;
					}
				});
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else if ($.get(compoData)) $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}