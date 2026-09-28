import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "carbon-components-svelte";
import TextBold from "carbon-icons-svelte/lib/TextBold.svelte";
import TextItalic from "carbon-icons-svelte/lib/TextItalic.svelte";
import TextUnderline from "carbon-icons-svelte/lib/TextUnderline.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function SelectedIconOnlyButton($$anchor) {
	let index = 1;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => index === 0);

		Button(node, {
			get isSelected() {
				return $.get($0);
			},
			kind: 'ghost',
			iconDescription: 'Bold',
			get icon() {
				return TextBold;
			},
			$$events: { click: () => index = 0 }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => index === 1);

		Button(node_1, {
			get isSelected() {
				return $.get($0);
			},
			kind: 'ghost',
			iconDescription: 'Italicize',
			get icon() {
				return TextItalic;
			},
			$$events: { click: () => index = 1 }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => index === 2);

		Button(node_2, {
			get isSelected() {
				return $.get($0);
			},
			kind: 'ghost',
			iconDescription: 'Underline',
			get icon() {
				return TextUnderline;
			},
			$$events: { click: () => index = 2 }
		});
	}

	$.append($$anchor, fragment);
}