import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let menuElement = undefined;
		let left = void 0;
		let top = void 0;

		run(() => {
			if (menuElement) {
				const rect = menuElement.getBoundingClientRect();
				const menuHeight = 0;

				left = window.innerWidth - rect.width;
				top = window.innerHeight - menuHeight;
			}
		});

		$$renderer.push(`<ul></ul>`);
	});
}