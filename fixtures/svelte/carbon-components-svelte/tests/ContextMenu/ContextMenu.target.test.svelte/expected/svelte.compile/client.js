import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContextMenu from "carbon-components-svelte/ContextMenu/ContextMenu.svelte";
import ContextMenuOption from "carbon-components-svelte/ContextMenu/ContextMenuOption.svelte";
import { onMount } from "svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="target-a">A</div> <div data-testid="target-b">B</div> <button type="button" data-testid="swap">swap</button> <!>`, 1);

export default function ContextMenu_target_test($$anchor, $$props) {
	$.push($$props, true);

	let targetA = null;
	let targetB = null;
	let target = null;

	onMount(() => {
		target = [targetA];
	});

	function swap() {
		target = [targetB];
	}

	var fragment = root_1();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => targetA = $$value, () => targetA);

	var div_1 = $.sibling(div, 2);

	$.bind_this(div_1, ($$value) => targetB = $$value, () => targetB);

	var button = $.sibling(div_1, 2);
	var node = $.sibling(button, 2);

	ContextMenu(node, {
		get target() {
			return target;
		},

		$$events: {
			open: (e) => {
				console.log("open", e.detail);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ContextMenuOption(node_1, { labelText: 'Option 1' });

			var node_2 = $.sibling(node_1, 2);

			ContextMenuOption(node_2, { labelText: 'Option 2' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.event('click', button, swap);
	$.append($$anchor, fragment);
	$.pop();
}