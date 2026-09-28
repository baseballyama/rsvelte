import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { GLTF, OrbitControls } from '@threlte/extras';
import { Checkbox, Folder, FpsGraph, List, Pane, Slider } from 'svelte-tweakpane-ui';
import LumaSplats from './LumaSplatsThree/LumaSplatsThree.svelte';
import RenderIndicator from './RenderIndicator.svelte';
import Splat from './Splat/Splat.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	// <LumaSplatsThree>
	let showLumaSplats = $.state(true);

	let lumaSplatsMode = $.state('object-env');

	// <Splat>
	let showSplat = $.state(true);

	let alphaHash = $.state(false);
	let alphaTest = $.state(0.06);
	let toneMapped = $.state(true);

	// Car
	let showPorsche = $.state(true);

	let paneExpanded = $.state(false);
	let gltfMaterials = $.state(void 0);

	$.user_effect(() => {
		if ($.get(gltfMaterials)) {
			Object.values($.get(gltfMaterials)).forEach((material) => {
				material.envMapIntensity = 5;
			});
		}
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	LumaSplats(node, {
		get visible() {
			return $.get(showLumaSplats);
		},
		source: 'https://lumalabs.ai/capture/4c15c22e-8655-4423-aeac-b08f017dda22',
		get mode() {
			return $.get(lumaSplatsMode);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [
			-32.3 * MathUtils.DEG2RAD,
			-18.5 * MathUtils.DEG2RAD,
			-6.4 * MathUtils.DEG2RAD
		]);

		let $1 = $.derived(() => $.get(alphaTest) > 0 ? $.get(alphaTest) : undefined);

		Splat(node_1, {
			get visible() {
				return $.get(showSplat);
			},
			position: [1.08, 2.21, -1.99],
			get rotation() {
				return $.get($0);
			},
			src: 'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
			get alphaHash() {
				return $.get(alphaHash);
			},

			get alphaTest() {
				return $.get($1);
			},

			get toneMapped() {
				return $.get(toneMapped);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => 57 * MathUtils.DEG2RAD);

		GLTF(node_2, {
			get visible() {
				return $.get(showPorsche);
			},
			position: [-1.48, -0.51, 2.15],
			get 'rotation.y'() {
				return $.get($0);
			},
			scale: 0.7,
			url: '/models/splat-example/porsche_959.glb',
			get materials() {
				return $.get(gltfMaterials);
			},

			set materials($$value) {
				$.set(gltfMaterials, $$value, true);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0.22, 2.44, 9.06],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			},
			fov: 25,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_3, 2);

	Pane(node_4, {
		position: 'fixed',
		title: 'Gaussian Splatting',
		get expanded() {
			return $.get(paneExpanded);
		},

		set expanded($$value) {
			$.set(paneExpanded, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_5 = $.first_child(fragment_2);

			Folder(node_5, {
				userExpandable: false,
				expanded: true,
				title: 'Luma',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_6 = $.first_child(fragment_3);

					Checkbox(node_6, {
						label: 'Show LumaSplats',
						get value() {
							return $.get(showLumaSplats);
						},

						set value($$value) {
							$.set(showLumaSplats, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					{
						var consequent = ($$anchor) => {
							List($$anchor, {
								options: { object: 'object', 'object-env': 'object-env', env: 'env' },
								get value() {
									return $.get(lumaSplatsMode);
								},

								set value($$value) {
									$.set(lumaSplatsMode, $$value, true);
								}
							});
						};

						$.if(node_7, ($$render) => {
							if ($.get(showLumaSplats)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_5, 2);

			Folder(node_8, {
				userExpandable: false,
				expanded: true,
				title: 'Splat',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_9 = $.first_child(fragment_5);

					Checkbox(node_9, {
						label: 'Show Splats',
						get value() {
							return $.get(showSplat);
						},

						set value($$value) {
							$.set(showSplat, $$value, true);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_6 = root_1();
							var node_11 = $.first_child(fragment_6);

							Checkbox(node_11, {
								label: 'alphaHash',
								get value() {
									return $.get(alphaHash);
								},

								set value($$value) {
									$.set(alphaHash, $$value, true);
								}
							});

							var node_12 = $.sibling(node_11, 2);

							Slider(node_12, {
								label: 'alphaTest',
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return $.get(alphaTest);
								},

								set value($$value) {
									$.set(alphaTest, $$value, true);
								}
							});

							var node_13 = $.sibling(node_12, 2);

							Checkbox(node_13, {
								label: 'toneMapped',
								get value() {
									return $.get(toneMapped);
								},

								set value($$value) {
									$.set(toneMapped, $$value, true);
								}
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_10, ($$render) => {
							if ($.get(showSplat)) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_8, 2);

			Folder(node_14, {
				title: 'Porsche',
				children: ($$anchor, $$slotProps) => {
					Checkbox($$anchor, {
						label: 'Show Porsche',
						get value() {
							return $.get(showPorsche);
						},

						set value($$value) {
							$.set(showPorsche, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Folder(node_15, {
				title: 'Rendering Activity',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_16 = $.first_child(fragment_8);

					RenderIndicator(node_16, {});

					var node_17 = $.sibling(node_16, 2);

					FpsGraph(node_17, {});
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}