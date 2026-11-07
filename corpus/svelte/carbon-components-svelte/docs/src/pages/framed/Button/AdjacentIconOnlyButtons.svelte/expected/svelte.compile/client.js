import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "carbon-components-svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";
import Save from "carbon-icons-svelte/lib/Save.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function AdjacentIconOnlyButtons($$anchor) {
	let lastAction = "";
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		kind: 'ghost',
		iconDescription: 'Add',
		tooltipPosition: 'right',
		get icon() {
			return Add;
		},
		$$events: { click: () => lastAction = "Add" }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		kind: 'ghost',
		iconDescription: 'Delete',
		tooltipPosition: 'right',
		get icon() {
			return TrashCan;
		},
		$$events: { click: () => lastAction = "Delete" }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		kind: 'ghost',
		iconDescription: 'Save',
		tooltipPosition: 'right',
		get icon() {
			return Save;
		},
		$$events: { click: () => lastAction = "Save" }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, `Clicked: ${lastAction ?? ''}`));
			$.append($$anchor, text);
		};

		$.if(node_3, ($$render) => {
			if (lastAction) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}