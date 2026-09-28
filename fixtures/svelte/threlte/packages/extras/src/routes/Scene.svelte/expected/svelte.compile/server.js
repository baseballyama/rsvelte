import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Sky } from '../lib/index.js';
import Gamepad from './Gamepad.svelte';
import MountedGamepad from './MountedGamepad.svelte';

export default function Scene($$renderer) {
	let listenToGamepad = true;
	let mountGamepad = false;

	if (browser && mountGamepad) {
		$$renderer.push('<!--[0-->');
		Gamepad($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (listenToGamepad) {
		$$renderer.push('<!--[0-->');
		MountedGamepad($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [3, 3, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$renderer) => {
				OrbitControls($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	Sky($$renderer, {});
	$$renderer.push(`<!----> `);
	Grid($$renderer, {});
	$$renderer.push(`<!----> `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.y': 1,
			children: ($$renderer) => {
				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { transparent: true, color: 'white' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.SphereGeometry) {
					$$renderer.push('<!--[-->');
					T.SphereGeometry($$renderer, {});
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
}