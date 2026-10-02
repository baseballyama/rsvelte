import * as $ from 'svelte/internal/server';
import Hoverable from './Hoverable.svelte';

export default function Slot_props03_input($$renderer) {
	Hoverable($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { hovering }) => {
				$$renderer.push(`<div${$.attr_class('svelte-12pir8e', void 0, { 'active': hovering })}>`);

				if (hovering) {
					$$renderer.push(`<!--[0--><p>I am being hovered upon.</p>`);
				} else {
					$$renderer.push(`<!--[-1--><p>Hover over me!</p>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}
		}
	});
}