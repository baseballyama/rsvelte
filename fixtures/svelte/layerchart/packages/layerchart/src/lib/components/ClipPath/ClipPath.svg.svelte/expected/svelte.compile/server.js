import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';
import { ClipPathState } from './ClipPath.shared.svelte.js';

export default function ClipPath_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('clipPath-', uid),
			useId,
			disabled = false,
			children,
			clip,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new ClipPathState(() => ({ id, useId, disabled, children, clip, ...rest }));
		const url = $.derived(() => `url(#${id})`);

		$$renderer.push(`<defs><clipPath${$.attributes({ id, ...rest }, void 0, void 0, void 0, 3)}>`);

		if (clip) {
			$$renderer.push('<!--[0-->');
			clip($$renderer, { id });
			$$renderer.push(`<!---->`);
		} else if (c.effectivePath) {
			$$renderer.push(`<!--[1--><path${$.attr('d', c.effectivePath)}${$.attr('clip-rule', rest.invert ? 'evenodd' : undefined)}></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (useId) {
			$$renderer.push(`<!--[0--><use${$.attr('href', `#${$.stringify(useId)}`)}></use>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></clipPath></defs>`);

		if (children) {
			$$renderer.push('<!--[0-->');

			if (disabled) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { id, url: url(), useId });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><g class="lc-clip-path-g"${$.attr_style('', { 'clip-path': url() })}>`);
				children($$renderer, { id, url: url(), useId });
				$$renderer.push(`<!----></g>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}