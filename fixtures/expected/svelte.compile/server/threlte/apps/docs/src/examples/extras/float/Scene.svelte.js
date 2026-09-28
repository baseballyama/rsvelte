import * as $ from 'svelte/internal/server';
import Blob from './Blob.svelte';
import { Environment, Float, Grid, interactivity, useGltf, useDraco } from '@threlte/extras';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();

		const dracoLoader = useDraco();
		const gltf = useGltf('/models/blobs/blobs.glb', { dracoLoader });
		const red = '#fe3d00';
		const blue = '#0000ff';

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		Float($$renderer, {
			rotationIntensity: 0.15,
			rotationSpeed: 2,
			children: ($$renderer) => {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						'position.y': 10,
						'position.z': 10,
						fov: 90,
						oncreate: (ref) => {
							ref.lookAt(0, 0, 0);
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Grid($$renderer, {
			'position.y': -10,
			sectionThickness: 1,
			infiniteGrid: true,
			cellColor: '#dddddd',
			sectionColor: '#ffffff',
			sectionSize: 10,
			cellSize: 2
		});

		$$renderer.push(`<!----> `);

		$.await($$renderer, gltf, () => {}, ({ nodes }) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Object.values(nodes));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let node = each_array[$$index];

				{
					function children($$renderer, { hovering }) {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.MeshPhysicalMaterial) {
										$$renderer.push('<!--[-->');

										T.MeshPhysicalMaterial($$renderer, {
											reflectivity: 1,
											metalness: 0.9,
											roughness: 0.2,
											color: hovering ? red : blue
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (node.geometry) {
										$$renderer.push('<!--[0-->');
										T($$renderer, { is: node.geometry });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					Blob($$renderer, { children, $$slots: { default: true } });
				}
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}