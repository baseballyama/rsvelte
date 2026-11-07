import * as $ from 'svelte/internal/server';
import { pannable } from './pannable.js';
import { spring } from 'svelte/motion';

export default function Actions_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const coords = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });

		function handlePanStart() {
			coords.stiffness = coords.damping = 1;
		}

		function handlePanMove(event) {
			coords.update(($coords) => ({
				x: $coords.x + event.detail.dx,
				y: $coords.y + event.detail.dy
			}));
		}

		function handlePanEnd(event) {
			coords.stiffness = 0.2;
			coords.damping = 0.4;
			coords.set({ x: 0, y: 0 });
		}

		$$renderer.push(`<div class="box svelte-5edke9"${$.attr_style(`transform: translate(${$.stringify($.store_get($$store_subs ??= {}, '$coords', coords).x)}px,${$.stringify($.store_get($$store_subs ??= {}, '$coords', coords).y)}px) rotate(${$.stringify($.store_get($$store_subs ??= {}, '$coords', coords).x * 0.2)}deg)`)}></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}