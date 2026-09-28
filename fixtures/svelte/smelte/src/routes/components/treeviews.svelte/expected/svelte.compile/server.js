import * as $ from 'svelte/internal/server';
import Treeview from "components/Treeview";
import Code from "docs/Code.svelte";
import treeview from "examples/treeview.txt";

export default function Treeviews($$renderer) {
	let selected = 'nothing';

	$$renderer.push(`<small>I selected ${$.escape(selected)}</small> `);

	Treeview($$renderer, {
		items: [
			{
				text: "test",
				items: [
					{ text: "subtest" },
					{ text: "subtest2" },
					{ text: "subtest3" },
					{
						text: "subtest4",
						items: [
							{ text: "subtest" },
							{ text: "subtest2" },
							{ text: "subtest3" },
							{ text: "subtest4" }
						]
					}
				]
			},

			{
				text: "test2",
				items: [
					{ text: "subtest" },
					{ text: "subtest2" },
					{ text: "subtest3" },
					{ text: "subtest4" }
				]
			},

			{
				text: "test3",
				items: [
					{ text: "subtest" },
					{ text: "subtest2" },
					{ text: "subtest3" },
					{ text: "subtest4" }
				]
			}
		]
	});

	$$renderer.push(`<!----> `);
	Code($$renderer, { code: treeview });
	$$renderer.push(`<!---->`);
}