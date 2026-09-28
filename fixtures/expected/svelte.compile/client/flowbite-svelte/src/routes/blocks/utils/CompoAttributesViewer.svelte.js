import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { getFilteredFileNames } from "./helpers";
import TableDefaultRow from "./TableDefaultRow.svelte";
import TableProp from "./TableProp.svelte";

var root = $.from_html(`<h4 class="mt-8 text-xl font-bold text-black dark:text-white"> </h4> <ul class="w-full"><!></ul>`, 1);
var root_1 = $.from_html(`<div id="compoData"></div>`);

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

	async function processComponents() {
		if ($.get(componentArray).length > 0) {
			importPromises = $.get(componentArray).map(async (component) => {
				const module = await import(`../component-data/${component}.json`);

				return { data: module };
			});
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
			var div = root_1();

			$.each(div, 21, () => $.get(compoData), $.index, ($$anchor, compo) => {
				var fragment_1 = root();
				var h4 = $.first_child(fragment_1);
				var text = $.only_child(h4, true);
				var ul = $.sibling(h4, 2);
				var node_1 = $.child(ul);

				TableProp(node_1, {
					children: ($$anchor, $$slotProps) => {
						TableDefaultRow($$anchor, {
							get items() {
								return $.get(compo).data.default.props;
							},
							rowState: 'hover'
						});
					},
					$$slots: { default: true }
				});

				$.reset(ul);
				$.template_effect(() => $.set_text(text, $.get(compo).data.default.name));
				$.append($$anchor, fragment_1);
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