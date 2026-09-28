import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="example svelte-1glilhy"><div class="hud svelte-1glilhy">Best tested in VR: walk around your playspace, then click a colored pad. The cyan feet marker
    should land in the middle of the selected pad.</div> `);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	VRButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}