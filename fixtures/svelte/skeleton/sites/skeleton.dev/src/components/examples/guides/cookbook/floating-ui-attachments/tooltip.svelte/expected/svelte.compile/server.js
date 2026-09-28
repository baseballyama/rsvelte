import * as $ from 'svelte/internal/server';
import { Popover } from './popover';
import { fade } from 'svelte/transition';

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tooltip = new Popover({ interaction: 'hover', placement: 'top' });

		$$renderer.push(`<span><p>This triggers a <span${$.attributes({ class: 'underline', ...tooltip.reference() })}>tooltip</span>.</p> `);

		if (tooltip.isOpen()) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...tooltip.floating(),
				'data-floating': true,
				class: 'card preset-filled-surface-100-900 z-10 p-4'
			})}><p>This is an example tooltip.</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span>`);
	});
}