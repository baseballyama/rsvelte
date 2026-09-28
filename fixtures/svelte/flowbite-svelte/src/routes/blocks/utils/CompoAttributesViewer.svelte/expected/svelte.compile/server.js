import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { getFilteredFileNames } from "./helpers";
import TableDefaultRow from "./TableDefaultRow.svelte";
import TableProp from "./TableProp.svelte";

export default function CompoAttributesViewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dirName = "", components } = $$props;
		let compoData = [];

		// default is find fileName using dirName
		const fileNames = $.derived(() => getFilteredFileNames(dirName));

		// if components are given (e.g. checkbox, etc in forms, typography, utils)
		// use the components string
		let componentArray = $.derived(() => components ? components.split(", ") : []);

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		let importPromises = [];

		async function processComponents() {
			if (componentArray().length > 0) {
				importPromises = componentArray().map(async (component) => {
					const module = await import(`../component-data/${component}.json`);

					return { data: module };
				});
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

		if (compoData) {
			$$renderer.push(`<!--[0--><div id="compoData"><!--[-->`);

			const each_array = $.ensure_array_like(compoData);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let compo = each_array[$$index];

				$$renderer.push(`<h4 class="mt-8 text-xl font-bold text-black dark:text-white">${$.escape(compo.data.default.name)}</h4> <ul class="w-full">`);

				TableProp($$renderer, {
					children: ($$renderer) => {
						TableDefaultRow($$renderer, { items: compo.data.default.props, rowState: 'hover' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></ul>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}