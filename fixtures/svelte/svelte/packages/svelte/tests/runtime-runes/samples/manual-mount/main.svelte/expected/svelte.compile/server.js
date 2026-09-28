import * as $ from 'svelte/internal/server';
import { mount, unmount } from 'svelte';
import Inner from './inner.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el;
		let component;
		let props = { count: 0 };

		function toggle() {
			if (component) {
				unmount(component);
				component = null;
			} else {
				component = mount(Inner, {
					target: el,
					props,
					context: new Map([['multiply', 2]]),
					events: { update: (e) => props.count = e.detail }
				});
			}
		}

		$$renderer.push(`<button>toggle</button> <div></div>`);
	});
}