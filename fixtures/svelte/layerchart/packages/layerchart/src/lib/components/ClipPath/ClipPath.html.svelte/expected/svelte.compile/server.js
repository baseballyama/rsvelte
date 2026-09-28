import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';
import { ClipPathState } from './ClipPath.shared.svelte.js';

export default function ClipPath_html($$renderer, $$props) {
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

		if (children) {
			$$renderer.push('<!--[0-->');

			if (disabled || !c.effectivePath) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { id, url: url(), useId });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="lc-clip-path-div"${$.attr_style('', {
					position: 'absolute',
					inset: '0',
					'clip-path': invert
						? `path(evenodd, "${c.effectivePath}")`
						: `path("${c.effectivePath}")`
				})}>`);

				children($$renderer, { id, url: url(), useId });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}