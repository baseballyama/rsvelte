import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import JSONView from "./JSONView.svelte";

export default function CompoAttributesViewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Replace dirName and components with a single fileName prop
		let { fileName = "" } = $$props;

		let compoData = null;

		async function loadComponentData() {
			try {
				// Import a single file directly without the array mapping
				const module = await import(`../component-data/${fileName}.json`);

				compoData = module;
			} catch(error) {
				console.error(`Error loading component data for ${fileName}:`, error);

				throw error;
			}
		}

		onMount(() => {
			if (fileName) {
				loadComponentData().catch((error) => {
					console.error("Error loading component data:", error);
				});
			}
		});

		if (compoData) {
			$$renderer.push(`<!--[0--><div id="compoData">`);
			JSONView($$renderer, { data: compoData.default });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}