import * as $ from 'svelte/internal/server';
import { Popover } from './popover';
import { slide } from 'svelte/transition';

export default function Popover_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const popover = new Popover();

		$$renderer.push(`<span><button${$.attributes({ ...popover.reference(), class: 'btn preset-filled' })}>Trigger</button> `);

		if (popover.isOpen()) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...popover.floating(),
				'data-floating': true,
				class: 'card preset-filled-surface-100-900 z-10 p-4'
			})}><p>This is an example popover.</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span>`);
	});
}