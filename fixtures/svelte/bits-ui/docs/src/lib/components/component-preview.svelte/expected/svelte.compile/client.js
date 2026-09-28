import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoContainer from "./demo-container.svelte";
import DemoCodeContainer from "./demo-code-container.svelte";
import { setCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Component_preview($$anchor, $$props) {
	$.push($$props, true);

	let nonExpandableItems = $.prop($$props, 'nonExpandableItems', 19, () => []),
		componentName = $.prop($$props, 'componentName', 19, () => $$props.fileName),
		variant = $.prop($$props, 'variant', 3, "collapsed");

	setCopyToClipboard();

	var fragment = root();
	var node = $.first_child(fragment);

	DemoContainer(node, {
		get wrapperClass() {
			return $$props.containerClass;
		},

		get size() {
			return $$props.size;
		},

		get componentName() {
			return componentName();
		},

		get name() {
			return $$props.name;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.preview);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	DemoCodeContainer(node_2, {
		get variant() {
			return variant();
		},

		get fileName() {
			return $$props.fileName;
		},

		get class() {
			return $$props.class;
		},

		get nonExpandableItems() {
			return nonExpandableItems();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}