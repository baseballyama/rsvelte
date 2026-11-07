import * as $ from 'svelte/internal/server';
import { Color } from 'three';
import { T, useThrelte } from '@threlte/core';
import { Text, Grid, Outlines, VirtualEnvironment, Stars } from '@threlte/extras';

import {
	XR,
	useXR,
	teleportControls,
	pointerControls,
	touchControls,
	Controller,
	Hand
} from '@threlte/xr';

import Sabers from './Sabers.svelte';
import Blocks from './Blocks.svelte';
import Mountains from './Mountains.svelte';
import Menu from './Menu.svelte';
import { Spring } from 'svelte/motion';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { scene } = useThrelte();
		const { isPresenting } = useXR();

		scene.environmentIntensity = 2;
		scene.background = new Color('#0e1625');
		teleportControls('left');
		teleportControls('right');
		pointerControls('left');
		pointerControls('right');
		touchControls('left');
		touchControls('right');

		let playing = false;
		const spring = Spring.of(() => $.store_get($$store_subs ??= {}, '$isPresenting', isPresenting) ? 0 : 1, { stiffness: 0.1, damping: 0.5 });

		{
			function fallback($$renderer) {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						position: [0, 1.8, 1],
						oncreate: (ref) => {
							ref.lookAt(0, 1.8, 0);
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			XR($$renderer, {
				fallback,
				children: ($$renderer) => {
					if (playing) {
						$$renderer.push('<!--[0-->');
						Sabers($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
						Controller($$renderer, { left: true });
						$$renderer.push(`<!----> `);
						Controller($$renderer, { right: true });
						$$renderer.push(`<!----> `);
						Hand($$renderer, { left: true });
						$$renderer.push(`<!----> `);
						Hand($$renderer, { right: true });
						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]--> `);
					Blocks($$renderer, { playing, oncomplete: () => playing = false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { fallback: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		if ($.store_get($$store_subs ??= {}, '$isPresenting', isPresenting) && !playing) {
			$$renderer.push('<!--[0-->');
			Menu($$renderer, { onstart: () => playing = true });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Text($$renderer, {
			anchorX: 'center',
			anchorY: 'center',
			position: [0, 1.9, 0],
			text: 'bonksaber!',
			font: '/fonts/adrip1.ttf',
			color: 'red',
			fillOpacity: spring.current,
			strokeOpacity: spring.current
		});

		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Mountains($$renderer, {});
		$$renderer.push(`<!----> `);
		Stars($$renderer, {});
		$$renderer.push(`<!----> `);

		Grid($$renderer, {
			infiniteGrid: true,
			cellColor: 'purple',
			type: 'lines',
			axis: 'x'
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				teleportSurface: true,
				children: ($$renderer) => {
					if (T.CylinderGeometry) {
						$$renderer.push('<!--[-->');
						T.CylinderGeometry($$renderer, { args: [2, 2, 0.1, 128] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'white', roughness: 0, metalness: 0.1 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Outlines($$renderer, { color: 'hotpink' });
					$$renderer.push(`<!---->`);
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
				position: [-30, 40, -100],
				oncreate: (ref) => ref.lookAt(0, 0, 0),
				children: ($$renderer) => {
					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { color: '#FF4F4F' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [5 / 2] });
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

		VirtualEnvironment($$renderer, {
			frames: 20,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [-8, 8, -10],
						oncreate: (ref) => ref.lookAt(0, 0, 0),
						children: ($$renderer) => {
							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: '#FF4F4F' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.CircleGeometry) {
								$$renderer.push('<!--[-->');
								T.CircleGeometry($$renderer, { args: [5 / 2] });
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
						position: [6, 8, -10],
						oncreate: (ref) => ref.lookAt(0, 0, 0),
						children: ($$renderer) => {
							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, { args: [10, 10] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: '#FFD0CB' });
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
						position: [4, 10, 5],
						oncreate: (ref) => ref.lookAt(0, 0, 0),
						children: ($$renderer) => {
							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, { args: [10, 10] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: '#2223FF' });
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

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}