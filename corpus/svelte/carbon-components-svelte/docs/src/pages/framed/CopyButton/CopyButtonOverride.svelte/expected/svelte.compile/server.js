import * as $ from 'svelte/internal/server';
import { CopyButton } from "carbon-components-svelte";
import copy from "clipboard-copy";

export default function CopyButtonOverride($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		CopyButton($$renderer, {
			text: 'Carbon svelte',
			copy: (text) => copy(text),
			tooltipAlignment: 'start'
		});
	});
}