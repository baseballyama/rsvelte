import * as $ from 'svelte/internal/server';
import { Popover } from '@svelte-put/popover';

export default function Quick_start($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const popover = new Popover();

		$$renderer.push(`<button${$.attributes({ class: 'c-btn', ...popover.control.attributes })}>Open me Popover</button> <div${$.attributes({
			class: 'fixed inset-0 m-auto p-6 backdrop:bg-black backdrop:opacity-50',
			...popover.target.attributes
		})}><p>Popover content. Click backdrop to dismiss</p></div>`);
	});
}