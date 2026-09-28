import * as $ from 'svelte/internal/server';
import { Project, Sequence, Sheet, Studio } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

export default function App($$renderer) {
	Studio($$renderer, {});
	$$renderer.push(`<!----> `);

	Project($$renderer, {
		config: { state },
		children: ($$renderer) => {
			Sheet($$renderer, {
				children: ($$renderer) => {
					Sequence($$renderer, {});
					$$renderer.push(`<!----> `);
					Scene($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}