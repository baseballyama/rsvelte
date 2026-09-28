import * as $ from 'svelte/internal/server';
import { CubeEnvironment, OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	let {
		environmentUrls,
		environmentIsBackground = true,
		materialMetalness = 1,
		materialRoughness = 0,
		useEnvironment = true
	} = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.z': 5,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			children: ($$renderer) => {
				if (T.TorusGeometry) {
					$$renderer.push('<!--[-->');
					T.TorusGeometry($$renderer, { args: [1, 0.4, 36, 192] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { metalness: materialMetalness, roughness: materialRoughness });
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

	if (useEnvironment) {
		$$renderer.push('<!--[0-->');
		CubeEnvironment($$renderer, { isBackground: environmentIsBackground, urls: environmentUrls });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}