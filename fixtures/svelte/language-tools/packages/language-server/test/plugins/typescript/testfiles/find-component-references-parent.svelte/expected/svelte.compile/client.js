import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from "./find-component-references-child.svelte";

var root = $.from_html(`<p>test</p> <p>test</p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Find_component_references_parent($$anchor, $$props) {
	$.push($$props, true);
	test();

	const theModule2 = import("./find-component-references-child.svelte");

	import("./find-component-references-child.svelte").then((module) => {
		new module.default({ target: document.body });
	});

	async function test() {
		const theModule = await import("./find-component-references-child.svelte");
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	Component1(node, {});

	var node_1 = $.sibling(node, 2);

	Component1(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}