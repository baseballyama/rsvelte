import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from "carbon-components-svelte";
import copy from "clipboard-copy";

export default function CopyButtonOverride($$anchor, $$props) {
	$.push($$props, true);

	CopyButton($$anchor, {
		text: 'Carbon svelte',
		copy: (text) => copy(text),
		tooltipAlignment: 'start'
	});

	$.pop();
}