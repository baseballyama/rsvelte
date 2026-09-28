import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import JSONView from "./JSONView.svelte";

var root = $.from_html(`<div id="compoData"><!></div>`);

export default function CompoAttributesViewer($$anchor, $$props) {
	$.push($$props, true);

	// Replace dirName and components with a single fileName prop
	let fileName = $.prop($$props, 'fileName', 3, "");

	let compoData = $.state(null);

	async function loadComponentData() {
		try {
			// Import a single file directly without the array mapping
			const module = await import(`../component-data/${fileName()}.json`);

			$.set(compoData, module, true);
		} catch(error) {
			console.error(`Error loading component data for ${fileName()}:`, error);

			throw error;
		}
	}

	onMount(() => {
		if (fileName()) {
			loadComponentData().catch((error) => {
				console.error("Error loading component data:", error);
			});
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			JSONView(node_1, {
				get data() {
					return $.get(compoData).default;
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(compoData)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}