import * as $ from 'svelte/internal/server';
import { mount, unmount } from 'svelte';
import Component from './Component.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el;
		let instance;

		function intro(animate) {
			if (instance) unmount(instance);

			instance = mount(Component, { target: el, intro: animate });
		}

		$$renderer.push(`<div></div> <button>mount with intro transition</button> <button>mount without intro transition</button>`);
	});
}