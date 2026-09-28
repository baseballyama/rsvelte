import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Align, Environment, Float, OrbitControls, Text3DGeometry } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	{
		function children($$renderer, { align }) {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						Text3DGeometry($$renderer, $.spread_props([
							{ font: '/fonts/Inter-semibold.blob' },
							rest,
							{
								oncreate: () => {
									align();
								}
							}
						]));

						$$renderer.push(`<!----> `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshStandardMaterial($$renderer, {
								color: '#FD3F00',
								toneMapped: false,
								metalness: 1.0,
								roughness: 0.1
							});

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

		Align($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	Environment($$renderer, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	$$renderer.push(`<!----> `);

	Float($$renderer, {
		rotationIntensity: [0, 3, 0],
		rotationSpeed: 1,
		floatingRange: [-5, 5],
		speed: 1,
		children: ($$renderer) => {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					'position.y': 0,
					'position.z': 20,
					fov: 90,
					children: ($$renderer) => {
						OrbitControls($$renderer, { enableDamping: true, enablePan: false, enableZoom: false });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}