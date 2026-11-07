import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import Robot from './Robot.svelte';
import { Grid } from '@threlte/extras';
import { Vector3 } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [0, 4, 15],
				fov: 50,
				oncreate: (ref) => {
					ref.lookAt(0, 1, 0);
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Grid($$renderer, {
			cellColor: 'yellow',
			sectionColor: 'orange',
			infiniteGrid: true,
			fadeDistance: 10,
			fadeOrigin: new Vector3(0, 0, 0)
		});

		$$renderer.push(`<!----> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [5, 5, 5], intensity: 1.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Robot($$renderer, {
			action: 'Walking',
			position: [-4, 0, 0],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});

		$$renderer.push(`<!----> `);
		Robot($$renderer, { action: 'Running', position: [0, 0, 0] });
		$$renderer.push(`<!----> `);

		Robot($$renderer, {
			action: 'Dance',
			position: [4, 0, 0],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});

		$$renderer.push(`<!---->`);
	});
}