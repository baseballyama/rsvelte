import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Text } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	let { $$slots, $$events, ...textProps } = $$props;

	if (T.OrthographicCamera) {
		$$renderer.push('<!--[-->');

		T.OrthographicCamera($$renderer, {
			zoom: 80,
			position: [0, 5, 10],
			makeDefault: true,
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	OrbitControls($$renderer, {
		autoRotate: true,
		enableDamping: true,
		enableZoom: false,
		autoRotateSpeed: 0.3
	});

	$$renderer.push(`<!----> `);
	Text($$renderer, $.spread_props([{ 'position.y': 0.5 }, textProps]));
	$$renderer.push(`<!----> `);
	Grid($$renderer, { sectionColor: '#FF3E00' });
	$$renderer.push(`<!---->`);
}