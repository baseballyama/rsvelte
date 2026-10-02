import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Treeview from "components/Treeview";
import Code from "docs/Code.svelte";
import treeview from "examples/treeview.txt";

var root = $.from_html(`<small> </small> <!> <!>`, 1);

export default function Treeviews($$anchor) {
	let selected = 'nothing';
	var fragment = root();
	var small = $.first_child(fragment);
	var text = $.only_child(small);
	var node = $.sibling(small, 2);

	Treeview(node, {
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
		],
		$$events: { select: (i) => selected = i.detail.text }
	});

	var node_1 = $.sibling(node, 2);

	Code(node_1, {
		get code() {
			return treeview;
		}
	});

	$.template_effect(() => $.set_text(text, `I selected ${selected ?? ''}`));
	$.append($$anchor, fragment);
}