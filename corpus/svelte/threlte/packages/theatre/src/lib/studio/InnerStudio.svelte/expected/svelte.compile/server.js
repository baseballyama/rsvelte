import * as $ from 'svelte/internal/server';
import { observe } from '@threlte/core';
import { writable } from 'svelte/store';
import Studio from '@theatre/studio';
import { studio } from '../consts.js';

Studio.initialize();
studio.set(Studio);

export default function InnerStudio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { hide, children } = $$props;
		const hideStore = writable(hide);

		observe.pre(() => [studio, hideStore], ([studio, hide]) => {
			if (hide) {
				studio?.ui.hide();
			} else {
				studio?.ui.restore();
			}

			return () => {
				studio?.ui.hide();
			};
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}