import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { GLTF, OrbitControls } from '@threlte/extras';
import { Checkbox, Folder, FpsGraph, List, Pane, Slider } from 'svelte-tweakpane-ui';
import LumaSplats from './LumaSplatsThree/LumaSplatsThree.svelte';
import RenderIndicator from './RenderIndicator.svelte';
import Splat from './Splat/Splat.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// <LumaSplatsThree>
		let showLumaSplats = true;

		let lumaSplatsMode = 'object-env';

		// <Splat>
		let showSplat = true;

		let alphaHash = false;
		let alphaTest = 0.06;
		let toneMapped = true;

		// Car
		let showPorsche = true;

		let paneExpanded = false;
		let gltfMaterials = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			LumaSplats($$renderer, {
				visible: showLumaSplats,
				source: 'https://lumalabs.ai/capture/4c15c22e-8655-4423-aeac-b08f017dda22',
				mode: lumaSplatsMode
			});

			$$renderer.push(`<!----> `);

			Splat($$renderer, {
				visible: showSplat,
				position: [1.08, 2.21, -1.99],
				rotation: [
					-32.3 * MathUtils.DEG2RAD,
					-18.5 * MathUtils.DEG2RAD,
					-6.4 * MathUtils.DEG2RAD
				],
				src: 'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
				alphaHash,
				alphaTest: alphaTest > 0 ? alphaTest : undefined,
				toneMapped
			});

			$$renderer.push(`<!----> `);

			GLTF($$renderer, {
				visible: showPorsche,
				position: [-1.48, -0.51, 2.15],
				'rotation.y': 57 * MathUtils.DEG2RAD,
				scale: 0.7,
				url: '/models/splat-example/porsche_959.glb',
				get materials() {
					return gltfMaterials;
				},

				set materials($$value) {
					gltfMaterials = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [0.22, 2.44, 9.06],
					oncreate: (ref) => {
						ref.lookAt(0, 0, 0);
					},
					fov: 25,
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

			Pane($$renderer, {
				position: 'fixed',
				title: 'Gaussian Splatting',
				get expanded() {
					return paneExpanded;
				},

				set expanded($$value) {
					paneExpanded = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Folder($$renderer, {
						userExpandable: false,
						expanded: true,
						title: 'Luma',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'Show LumaSplats',
								get value() {
									return showLumaSplats;
								},

								set value($$value) {
									showLumaSplats = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (showLumaSplats) {
								$$renderer.push('<!--[0-->');

								List($$renderer, {
									options: { object: 'object', 'object-env': 'object-env', env: 'env' },
									get value() {
										return lumaSplatsMode;
									},

									set value($$value) {
										lumaSplatsMode = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						userExpandable: false,
						expanded: true,
						title: 'Splat',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'Show Splats',
								get value() {
									return showSplat;
								},

								set value($$value) {
									showSplat = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (showSplat) {
								$$renderer.push('<!--[0-->');

								Checkbox($$renderer, {
									label: 'alphaHash',
									get value() {
										return alphaHash;
									},

									set value($$value) {
										alphaHash = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									label: 'alphaTest',
									min: 0,
									max: 1,
									step: 0.01,
									get value() {
										return alphaTest;
									},

									set value($$value) {
										alphaTest = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Checkbox($$renderer, {
									label: 'toneMapped',
									get value() {
										return toneMapped;
									},

									set value($$value) {
										toneMapped = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Porsche',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'Show Porsche',
								get value() {
									return showPorsche;
								},

								set value($$value) {
									showPorsche = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Rendering Activity',
						children: ($$renderer) => {
							RenderIndicator($$renderer, {});
							$$renderer.push(`<!----> `);
							FpsGraph($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}