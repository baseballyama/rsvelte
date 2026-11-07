import * as $ from 'svelte/internal/server';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';
import { Button, ButtonGroup } from 'svelte-ux';

export default function GeoPathGlobeControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isPlaying, selectedFeature, play, stop } = $$props;

		$$renderer.push(`<div class="absolute top-0 left-0 z-10 flex items-center gap-3 screenshot-hidden">`);

		ButtonGroup($$renderer, {
			variant: 'fill-light',
			color: 'primary',
			size: 'sm',
			class: 'outline rounded-full',
			children: ($$renderer) => {
				Button($$renderer, {
					icon: LucidePlay,
					disabled: isPlaying,
					classes: { icon: 'text-xs', root: 'px-2 py-1' }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: LucideSquare,
					disabled: !isPlaying,
					classes: { icon: 'text-xs', root: 'px-2 py-1' }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isPlaying && selectedFeature) {
			$$renderer.push(`<!--[0--><span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full">${$.escape(selectedFeature?.properties.name ?? '')}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}