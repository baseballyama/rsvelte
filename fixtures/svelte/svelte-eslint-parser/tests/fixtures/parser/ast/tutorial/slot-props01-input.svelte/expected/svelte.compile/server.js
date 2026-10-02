import * as $ from 'svelte/internal/server';
import Hoverable from './Hoverable.svelte';

export default function Slot_props01_input($$renderer) {
	Hoverable($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { hovering: active }) => {
				$$renderer.push(`<div${$.attr_class('svelte-17xm8ms', void 0, { 'active': active })}>`);

				if (active) {
					$$renderer.push(`<!--[0--><p>I am being hovered upon.</p>`);
				} else {
					$$renderer.push(`<!--[-1--><p>Hover over me!</p>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}
		}
	});
}