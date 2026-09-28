import * as $ from 'svelte/internal/server';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import { useDemoFullscreen } from './demo.svelte.js';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';

export default function Demo_control_fullscreen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className, $$slots, $$events, ...rest } = $$props;
		const fullscreenState = useDemoFullscreen();

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			'aria-label': 'View in fullscreen',
			class: $.clsx(cn(controlVariants(), className)),
			...rest
		})}>`);

		MaximizeIcon($$renderer, {});
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { ref });
	});
}