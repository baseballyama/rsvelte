import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, Grid, interactivity, OrbitControls } from '@threlte/extras';
import { AutoColliders, Debug } from '@threlte/rapier';
import { DoubleSide, MathUtils } from 'three';
import Rope from './Rope.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { debug, damping, segments } = $$props;

		interactivity();

		let ropeEnd = [0, 0, 0];

		const onpointermove = (e) => {
			e.point.x -= 0.2;
			ropeEnd = e.point.toArray();
		};

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (debug) {
			$$renderer.push('<!--[0-->');
			Debug($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [-10, 5, 10],
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true, enableZoom: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Grid($$renderer, {
			sectionColor: '#122036',
			cellColor: '#122036',
			'position.y': -5
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				onpointermove,
				'rotation.y': 90 * MathUtils.DEG2RAD,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { color: '#0A0F19', side: DoubleSide });
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

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: [-5, 0, 0],
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [0.2] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#335086' });
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

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: ropeEnd,
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [0.2] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#335086' });
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

		AutoColliders($$renderer, {
			shape: 'cuboid',
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [-2.5, 0, -1],
						children: ($$renderer) => {
							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, { color: '#335086' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		AutoColliders($$renderer, {
			shape: 'cuboid',
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [-2.5, 0, 1],
						children: ($$renderer) => {
							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, { color: '#335086' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!---->`);

		{
			Rope($$renderer, {
				ballRadius: 0.2,
				ropeStart: [-5, 0, 0],
				ropeEnd,
				length: 7,
				segments,
				damping
			});
		}

		$$renderer.push(`<!---->`);
	});
}