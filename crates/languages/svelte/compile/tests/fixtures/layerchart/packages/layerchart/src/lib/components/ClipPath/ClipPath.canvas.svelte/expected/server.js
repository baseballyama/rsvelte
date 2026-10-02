import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';
import { ClipPathState } from './ClipPath.shared.svelte.js';

export default function ClipPath_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('clipPath-', uid),
			useId,
			disabled = false,
			invert = false,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new ClipPathState(() => ({ id, useId, disabled, invert, children, ...rest }));
		const url = $.derived(() => `url(#${id})`);

		// Cache the Path2D so `ctx.clip()` gets a stable reference per `path` change.
		const canvasPath = $.derived(() => c.effectivePath ? new Path2D(c.effectivePath) : undefined);

		c.chartCtx.registerComponent({
			name: 'ClipPath',
			kind: 'group',
			canvasRender: {
				render: (ctx) => {
					if (!disabled && canvasPath()) {
						ctx.clip(canvasPath(), invert ? 'evenodd' : 'nonzero');
					}
				},
				deps: () => [disabled, canvasPath(), invert]
			}
		});

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, { id, url: url(), useId });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}