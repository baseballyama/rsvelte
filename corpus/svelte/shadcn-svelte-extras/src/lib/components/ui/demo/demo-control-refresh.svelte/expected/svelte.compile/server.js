import * as $ from 'svelte/internal/server';
import { useDemoRefresh } from './demo.svelte.js';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';
import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

export default function Demo_control_refresh($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className, $$slots, $$events, ...rest } = $$props;
		const refreshState = useDemoRefresh();

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			'aria-label': 'Refresh',
			class: $.clsx(cn(controlVariants(), className)),
			...rest
		})}>`);

		RotateCcwIcon($$renderer, {});
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { ref });
	});
}