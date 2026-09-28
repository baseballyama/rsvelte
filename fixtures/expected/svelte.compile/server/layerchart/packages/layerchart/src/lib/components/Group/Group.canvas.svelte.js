import * as $ from 'svelte/internal/server';
import { GroupState } from './Group.shared.svelte.js';

export default function Group_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;
		const c = new GroupState(() => ({ children, ...rest }));

		c.chartCtx.registerComponent({
			name: 'Group',
			kind: 'group',
			canvasRender: {
				render: (ctx) => {
					ctx.translate(c.motionX ?? 0, c.motionY ?? 0);

					if (rest.opacity != null) {
						ctx.globalAlpha *= rest.opacity;
					}
				},

				events: {
					click: rest.onclick,
					dblclick: rest.ondblclick,
					pointerenter: rest.onpointerenter,
					pointermove: rest.onpointermove,
					pointerleave: rest.onpointerleave,
					pointerdown: rest.onpointerdown
				},
				deps: () => [c.motionX, c.motionY, rest.opacity]
			}
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}