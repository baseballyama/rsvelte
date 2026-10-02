import * as $ from 'svelte/internal/server';
import { Button } from "carbon-components-svelte";
import TextBold from "carbon-icons-svelte/lib/TextBold.svelte";
import TextItalic from "carbon-icons-svelte/lib/TextItalic.svelte";
import TextUnderline from "carbon-icons-svelte/lib/TextUnderline.svelte";

export default function SelectedIconOnlyButton($$renderer) {
	let index = 1;

	Button($$renderer, {
		isSelected: index === 0,
		kind: 'ghost',
		iconDescription: 'Bold',
		icon: TextBold
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		isSelected: index === 1,
		kind: 'ghost',
		iconDescription: 'Italicize',
		icon: TextItalic
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		isSelected: index === 2,
		kind: 'ghost',
		iconDescription: 'Underline',
		icon: TextUnderline
	});

	$$renderer.push(`<!---->`);
}