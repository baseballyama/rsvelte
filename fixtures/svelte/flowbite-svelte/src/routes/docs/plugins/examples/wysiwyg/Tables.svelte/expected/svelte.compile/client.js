import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	TableButtonGroup1,
	TableButtonGroup2,
	TextEditor,
	ToolbarRowWrapper
} from "@flowbite-svelte-plugins/texteditor";

var root = $.from_html(`<!> <!>`, 1);

export default function Tables($$anchor) {
	let editorInstance = $.state(null);
	const content = "<p>Understanding global <strong>population growth trends</strong> is essential for analyzing the development and future of nations. Population growth rates provide insights into economic prospects, resource allocation, and potential challenges for countries worldwide.</p><p>Here is an example of population data:</p><div class=tableWrapper><table style=min-width:75px><col><col><col><tr><th colspan=1 rowspan=1><p>Country<th colspan=1 rowspan=1><p>Population<th colspan=1 rowspan=1><p>Growth rate<tr><td colspan=1 rowspan=1><p>United States<td colspan=1 rowspan=1><p>333 million<td colspan=1 rowspan=1><p>0.4%<tr><td colspan=1 rowspan=1><p>China<td colspan=1 rowspan=1><p>1.41 billion<td colspan=1 rowspan=1><p>0%<tr><td colspan=1 rowspan=1><p>Germany<td colspan=1 rowspan=1><p>83.8 million<td colspan=1 rowspan=1><p>0.7%<tr><td colspan=1 rowspan=1><p>India<td colspan=1 rowspan=1><p>1.42 billion<td colspan=1 rowspan=1><p>1.0%<tr><td colspan=1 rowspan=1><p>Brazil<td colspan=1 rowspan=1><p>214 million<td colspan=1 rowspan=1><p>0.6%<tr><td colspan=1 rowspan=1><p>Indonesia<td colspan=1 rowspan=1><p>273 million<td colspan=1 rowspan=1><p>1.1%<tr><td colspan=1 rowspan=1><p>Pakistan<td colspan=1 rowspan=1><p>231 million<td colspan=1 rowspan=1><p>2.0%<tr><td colspan=1 rowspan=1><p>Nigeria<td colspan=1 rowspan=1><p>223 million<td colspan=1 rowspan=1><p>2.5%</table></div><p>Learn more about global population trends from reliable sources like the <a href=https://www.worldpopulationreview.com>World Population Review</a>.</p>";

	TextEditor($$anchor, {
		content,
		contentprops: { id: "tables-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToolbarRowWrapper(node, {
				children: ($$anchor, $$slotProps) => {
					TableButtonGroup1($$anchor, {
						get editor() {
							return $.get(editorInstance);
						}
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ToolbarRowWrapper(node_1, {
				toolbarrawprops: { top: false },
				children: ($$anchor, $$slotProps) => {
					TableButtonGroup2($$anchor, {
						get editor() {
							return $.get(editorInstance);
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}