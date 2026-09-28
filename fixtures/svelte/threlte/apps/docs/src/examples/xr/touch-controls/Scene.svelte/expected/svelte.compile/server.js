import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { touchControls, useXR, Controller, Hand } from '@threlte/xr';
import TouchDebug from './TouchDebug.svelte';
import Button from './Button.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { isPresenting } = useXR();

		touchControls('left');
		touchControls('right');

		let debug = false;

		Controller($$renderer, { left: true });
		$$renderer.push(`<!----> `);
		Controller($$renderer, { right: true });
		$$renderer.push(`<!----> `);
		Hand($$renderer, { left: true });
		$$renderer.push(`<!----> `);
		Hand($$renderer, { right: true });
		$$renderer.push(`<!----> `);
		Button($$renderer, { position: [-0.18, 1.3, -0.25], color: '#e11d48' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { position: [-0.06, 1.3, -0.25], color: '#16a34a' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { position: [0.06, 1.3, -0.25], color: '#2563eb' });
		$$renderer.push(`<!----> `);

		Button($$renderer, {
			position: [0.18, 1.3, -0.25],
			color: '#6b7280',
			onclick: () => debug = !debug
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.y': 1.3,
				'position.z': -0.3,
				scale: $.store_get($$store_subs ??= {}, '$isPresenting', isPresenting) ? 1 : 0.001,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, { args: [0.6, 0.2] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#1f2937', transparent: true, opacity: 0.6 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (debug) {
			$$renderer.push('<!--[0-->');
			TouchDebug($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}