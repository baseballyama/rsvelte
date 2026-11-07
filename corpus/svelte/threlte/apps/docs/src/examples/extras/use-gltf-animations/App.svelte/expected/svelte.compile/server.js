import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Button, Folder, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let scene = void 0;
		let animating = false;
		const actions = $.derived(() => scene?.actions);
		const action = $.derived(() => $.store_get($$store_subs ??= {}, '$actions', actions())?.['Take 001']);

		Pane($$renderer, {
			position: 'fixed',
			title: 'littlest tokyo',
			children: ($$renderer) => {
				Folder($$renderer, {
					title: 'animation',
					children: ($$renderer) => {
						Button($$renderer, { disabled: animating, title: 'play' });
						$$renderer.push(`<!----> `);
						Button($$renderer, { disabled: !animating, title: 'stop' });
						$$renderer.push(`<!----> `);
						Button($$renderer, { disabled: !animating, title: 'reset' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1esaq0j">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}