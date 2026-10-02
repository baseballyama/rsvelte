import * as $ from 'svelte/internal/server';
import { Button } from "carbon-components-svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";
import Save from "carbon-icons-svelte/lib/Save.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function AdjacentIconOnlyButtons($$renderer) {
	let lastAction = "";

	Button($$renderer, {
		kind: 'ghost',
		iconDescription: 'Add',
		tooltipPosition: 'right',
		icon: Add
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'ghost',
		iconDescription: 'Delete',
		tooltipPosition: 'right',
		icon: TrashCan
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'ghost',
		iconDescription: 'Save',
		tooltipPosition: 'right',
		icon: Save
	});

	$$renderer.push(`<!----> `);

	if (lastAction) {
		$$renderer.push(`<!--[0-->Clicked: ${$.escape(lastAction)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}