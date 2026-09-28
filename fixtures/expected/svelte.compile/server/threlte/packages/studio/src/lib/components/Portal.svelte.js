import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

function portal(el, target = 'body') {
	let targetEl;

	async function update(newTarget) {
		target = newTarget;

		if (typeof target === 'string') {
			targetEl = document.querySelector(target);

			if (targetEl === null) {
				await tick();
				targetEl = document.querySelector(target);
			}

			if (targetEl === null) {
				throw new Error(`No element found matching css selector: '${target}'`);
			}
		} else {
			targetEl = target;
		}

		targetEl.append(el);
	}

	update(target);

	return {
		update,
		destroy() {
			el.remove();
		}
	};
}

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { target = 'body', children, $$slots, $$events, ...rest

		/**
		 * DOM Element or CSS Selector
		 */
		 } = $$props;

		$$renderer.push(`<div${$.attributes({ style: 'display: contents;', ...rest })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}