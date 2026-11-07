import * as $ from 'svelte/internal/server';

import {
	TableButtonGroup1,
	TableButtonGroup2,
	TextEditor,
	ToolbarRowWrapper
} from "@flowbite-svelte-plugins/texteditor";

export default function Tables($$renderer) {
	let editorInstance = null;
	const content = "<p>Understanding global <strong>population growth trends</strong> is essential for analyzing the development and future of nations. Population growth rates provide insights into economic prospects, resource allocation, and potential challenges for countries worldwide.</p><p>Here is an example of population data:</p><div class=tableWrapper><table style=min-width:75px><col><col><col><tr><th colspan=1 rowspan=1><p>Country<th colspan=1 rowspan=1><p>Population<th colspan=1 rowspan=1><p>Growth rate<tr><td colspan=1 rowspan=1><p>United States<td colspan=1 rowspan=1><p>333 million<td colspan=1 rowspan=1><p>0.4%<tr><td colspan=1 rowspan=1><p>China<td colspan=1 rowspan=1><p>1.41 billion<td colspan=1 rowspan=1><p>0%<tr><td colspan=1 rowspan=1><p>Germany<td colspan=1 rowspan=1><p>83.8 million<td colspan=1 rowspan=1><p>0.7%<tr><td colspan=1 rowspan=1><p>India<td colspan=1 rowspan=1><p>1.42 billion<td colspan=1 rowspan=1><p>1.0%<tr><td colspan=1 rowspan=1><p>Brazil<td colspan=1 rowspan=1><p>214 million<td colspan=1 rowspan=1><p>0.6%<tr><td colspan=1 rowspan=1><p>Indonesia<td colspan=1 rowspan=1><p>273 million<td colspan=1 rowspan=1><p>1.1%<tr><td colspan=1 rowspan=1><p>Pakistan<td colspan=1 rowspan=1><p>231 million<td colspan=1 rowspan=1><p>2.0%<tr><td colspan=1 rowspan=1><p>Nigeria<td colspan=1 rowspan=1><p>223 million<td colspan=1 rowspan=1><p>2.5%</table></div><p>Learn more about global population trends from reliable sources like the <a href=https://www.worldpopulationreview.com>World Population Review</a>.</p>";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "tables-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ToolbarRowWrapper($$renderer, {
					children: ($$renderer) => {
						TableButtonGroup1($$renderer, { editor: editorInstance });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToolbarRowWrapper($$renderer, {
					toolbarrawprops: { top: false },
					children: ($$renderer) => {
						TableButtonGroup2($$renderer, { editor: editorInstance });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}