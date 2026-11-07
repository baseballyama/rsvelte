import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Sky } from '@threlte/extras';
import Ducks from './world/Ducks.svelte';
import Island from './world/Island.svelte';
import Water from './world/Water.svelte';
import Controls, { baseFov } from './Controls.svelte';
import LensView from './scope/LensView.svelte';
import Scope from './scope/Scope.svelte';

export default function Scene($$renderer) {
	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [0, 1.5, 20],
			fov: baseFov,
			children: ($$renderer) => {
				{
					function children($$renderer, { ref }) {
						LensView($$renderer, { scope: ref });
					}

					Scope($$renderer, { children, $$slots: { default: true } });
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
	Controls($$renderer, {});
	$$renderer.push(`<!----> `);
	Sky($$renderer, { elevation: 0.5, azimuth: 130 });
	$$renderer.push(`<!----> `);
	Water($$renderer, {});
	$$renderer.push(`<!----> `);

	Island($$renderer, {
		scale: 0.2,
		'position.x': -5,
		'position.y': -0.01,
		'position.z': 0
	});

	$$renderer.push(`<!----> `);
	Ducks($$renderer, {});
	$$renderer.push(`<!---->`);
}