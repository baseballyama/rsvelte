import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Bounds, SoftShadows } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import Balls from './Balls.svelte';
import Cabinet from './Cabinet.svelte';
import ControlPanelHUD from './ControlPanelHUD.svelte';
import Frame from './Frame.svelte';
import Launcher from './Launcher.svelte';
import Pegs from './Pegs.svelte';
import Pockets from './Pockets.svelte';
import Windmills from './Windmills.svelte';
import { CABINET_WIDTH, CROWN_Y, FIELD_HEIGHT } from './gameState.svelte';

export default function Scene($$renderer, $$props) {
	let { debug } = $$props;

	SoftShadows($$renderer, {});
	$$renderer.push(`<!----> `);

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');

		T.DirectionalLight($$renderer, {
			position: [4, 8, 6],
			intensity: 2,
			castShadow: true,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.top': CROWN_Y + 1,
			'shadow.camera.bottom': -FIELD_HEIGHT,
			'shadow.camera.left': -CABINET_WIDTH,
			'shadow.camera.right': CABINET_WIDTH
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, { intensity: 0.4 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.PointLight) {
		$$renderer.push('<!--[-->');

		T.PointLight($$renderer, {
			position: [0, 0, 4],
			intensity: 20,
			color: '#ff4488',
			distance: 12
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');
		T.PerspectiveCamera($$renderer, { makeDefault: true, fov: 40, position: [3, 0, 18] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Bounds($$renderer, {
		animate: false,
		margin: 0.1,
		children: ($$renderer) => {
			Cabinet($$renderer, {});
			$$renderer.push(`<!----> `);
			Frame($$renderer, {});
			$$renderer.push(`<!----> `);
			Pegs($$renderer, {});
			$$renderer.push(`<!----> `);
			Windmills($$renderer, {});
			$$renderer.push(`<!----> `);
			Pockets($$renderer, {});
			$$renderer.push(`<!----> `);
			Launcher($$renderer, {});
			$$renderer.push(`<!----> `);
			ControlPanelHUD($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Balls($$renderer, {});
	$$renderer.push(`<!----> `);

	if (debug) {
		$$renderer.push('<!--[0-->');
		Debug($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}