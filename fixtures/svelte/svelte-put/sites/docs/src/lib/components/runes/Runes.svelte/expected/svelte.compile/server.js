import * as $ from 'svelte/internal/server';
import { Popover } from '@svelte-put/popover';
import { compute } from '$lib/popover/compute';

export default function Runes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: cls, $$slots, $$events, ...rest } = $$props;
		let controlEl;
		let targetEl;
		let arrowEl;
		let cleanup = () => {};

		const popover = new Popover({
			triggers: { hover: true, focus: true },
			plugins: () => ({
				target: {
					attributes: {
						role: 'tooltip',
						onbeforetoggle: (e) => {
							if (e.newState !== 'open') return cleanup();

							cleanup = compute(controlEl, targetEl, arrowEl);
						}
					},
					actions: [
						(node) => {
							node.classList.toggle('enhanced', true);
						}
					]
				}
			})
		});

		$$renderer.push(`<div${$.attributes({ class: `not-prose ${$.stringify(cls)}`, ...rest })}><button${$.attributes({
			type: 'button',
			class: 'c-btn c-btn--icon',
			...popover.control.attributes
		})}><svg inline-src="runes" width="80" height="80"></svg> <span class="sr-only">Run support</span></button> <div${$.attributes({ ...popover.target.attributes, class: 'c-tooltip' })}><div class="arrow"></div> <p>Compatible with or powered directly by <a href="https://svelte.dev/blog/runes" class="c-link">Svelte runes</a>.</p></div></div>`);
	});
}