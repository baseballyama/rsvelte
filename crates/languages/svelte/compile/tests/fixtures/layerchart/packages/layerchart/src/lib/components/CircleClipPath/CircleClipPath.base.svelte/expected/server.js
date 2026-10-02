import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';

export default function CircleClipPath_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ClipPath,
			id = createId('clipPath-', uid),
			cx = 0,
			cy = 0,
			r,
			disabled = false,
			invert = false,
			children
		} = $$props;

		const path = $.derived(() => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`);

		if (ClipPath) {
			$$renderer.push('<!--[-->');
			ClipPath($$renderer, { id, disabled, invert, children, path: path() });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}