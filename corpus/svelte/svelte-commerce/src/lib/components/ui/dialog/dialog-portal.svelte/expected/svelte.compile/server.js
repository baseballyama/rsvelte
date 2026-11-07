import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from 'bits-ui';

export default function Dialog_portal($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;
	const children_render = $.derived(() => children);

	{
		function children($$renderer) {
			children_render()?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		if (DialogPrimitive.Portal) {
			$$renderer.push('<!--[-->');
			DialogPrimitive.Portal($$renderer, { children, $$slots: { default: true } });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}