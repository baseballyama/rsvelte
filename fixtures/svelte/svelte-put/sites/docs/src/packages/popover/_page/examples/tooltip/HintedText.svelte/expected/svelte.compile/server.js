import * as $ from 'svelte/internal/server';
import { Popover } from '@svelte-put/popover';
import { compute } from './compute';
import './tooltip.css';

export default function HintedText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, hint, class: cls, $$slots, $$events, ...rest } = $$props;
		let controlEl;
		let targetEl;
		let arrowEl;
		let cleanup = () => {};

		const tooltipPlugin = () => ({
			name: 'tooltip',
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
		});

		const popover = new Popover({
			triggers: { hover: true, focus: true },
			plugins: tooltipPlugin
		});

		$$renderer.push(`<button${$.attributes({
			class: `inline-block ${$.stringify(cls)}`,
			...popover.control.attributes,
			...rest
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></button> <span${$.attributes({ class: 'text-hint', ...popover.target.attributes })}><span class="arrow"></span> `);
		hint($$renderer);
		$$renderer.push(`<!----></span>`);
	});
}