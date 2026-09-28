import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Color, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';

import {
	ClampToEdgeWrapping,
	MirroredRepeatWrapping,
	RepeatWrapping,
	ACESFilmicToneMapping,
	AgXToneMapping,
	CineonToneMapping,
	LinearToneMapping,
	NeutralToneMapping,
	NoToneMapping,
	ReinhardToneMapping
} from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="svelte-9mzhna"><!></div>`, 1);

export default function App($$anchor) {
	const toneMappingOptions = {
		ACESFilmic: ACESFilmicToneMapping,
		AgX: AgXToneMapping,
		Cineon: CineonToneMapping,
		Linear: LinearToneMapping,
		NeutralToneMapping,
		None: NoToneMapping,
		Reinhard: ReinhardToneMapping
	};

	const wrappingOptions = {
		ClampToEdge: ClampToEdgeWrapping,
		MirroredRepeat: MirroredRepeatWrapping,
		Repeat: RepeatWrapping
	};

	const canvasSize = 1024;
	let sceneClearColor = $.state('#000000');
	let sceneToneMapping = $.state($.proxy(AgXToneMapping));
	let gradientStartColor = $.state('#ff00ff');
	let gradientEndColor = $.state('#ffff00');
	let gradientStartX = $.state(0);
	let gradientStartY = $.state(0);
	let gradientEndX = $.state(0);
	let gradientEndY = $.state(canvasSize);
	let textureCenterX = $.state(0);
	let textureCenterY = $.state(0);
	let textureOffsetX = $.state(0);
	let textureOffsetY = $.state(0);
	let textureRepeatX = $.state(1);
	let textureRepeatY = $.state(1);
	let textureRotationDegrees = $.state(0);
	let textureWrapS = $.state($.proxy(ClampToEdgeWrapping));
	let textureWrapT = $.state($.proxy(ClampToEdgeWrapping));
	let textureRotation = $.derived(() => Math.PI / 180 * $.get(textureRotationDegrees));
	var fragment = root_3();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				get options() {
					return toneMappingOptions;
				},
				label: 'tone mapping',
				get value() {
					return $.get(sceneToneMapping);
				},

				set value($$value) {
					$.set(sceneToneMapping, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Color(node_2, {
				label: 'clear color',
				get value() {
					return $.get(sceneClearColor);
				},

				set value($$value) {
					$.set(sceneClearColor, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Folder(node_3, {
				title: 'gradient props',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Color(node_4, {
						label: 'start color',
						get value() {
							return $.get(gradientStartColor);
						},

						set value($$value) {
							$.set(gradientStartColor, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Color(node_5, {
						label: 'end color',
						get value() {
							return $.get(gradientEndColor);
						},

						set value($$value) {
							$.set(gradientEndColor, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Slider(node_6, {
						label: 'start x',
						min: 0,
						max: canvasSize,
						step: 1,
						get value() {
							return $.get(gradientStartX);
						},

						set value($$value) {
							$.set(gradientStartX, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Slider(node_7, {
						label: 'start y',
						min: 0,
						max: canvasSize,
						step: 1,
						get value() {
							return $.get(gradientStartY);
						},

						set value($$value) {
							$.set(gradientStartY, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Slider(node_8, {
						label: 'end x',
						min: 0,
						max: canvasSize,
						step: 1,
						get value() {
							return $.get(gradientEndX);
						},

						set value($$value) {
							$.set(gradientEndX, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Slider(node_9, {
						label: 'end y',
						min: 0,
						max: canvasSize,
						step: 1,
						get value() {
							return $.get(gradientEndY);
						},

						set value($$value) {
							$.set(gradientEndY, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_3, 2);

			Folder(node_10, {
				title: 'texture props',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_11 = $.first_child(fragment_3);

					List(node_11, {
						label: 'wrapS',
						get options() {
							return wrappingOptions;
						},

						get value() {
							return $.get(textureWrapS);
						},

						set value($$value) {
							$.set(textureWrapS, $$value, true);
						}
					});

					var node_12 = $.sibling(node_11, 2);

					List(node_12, {
						label: 'wrapT',
						get options() {
							return wrappingOptions;
						},

						get value() {
							return $.get(textureWrapT);
						},

						set value($$value) {
							$.set(textureWrapT, $$value, true);
						}
					});

					var node_13 = $.sibling(node_12, 2);

					Slider(node_13, {
						label: 'centerX',
						min: -0.5,
						max: 1.5,
						step: 0.5,
						get value() {
							return $.get(textureCenterX);
						},

						set value($$value) {
							$.set(textureCenterX, $$value, true);
						}
					});

					var node_14 = $.sibling(node_13, 2);

					Slider(node_14, {
						label: 'centerY',
						min: -0.5,
						max: 1.5,
						step: 0.5,
						get value() {
							return $.get(textureCenterY);
						},

						set value($$value) {
							$.set(textureCenterY, $$value, true);
						}
					});

					var node_15 = $.sibling(node_14, 2);

					Slider(node_15, {
						label: 'offsetX',
						min: -2,
						max: 2,
						step: 1,
						get value() {
							return $.get(textureOffsetX);
						},

						set value($$value) {
							$.set(textureOffsetX, $$value, true);
						}
					});

					var node_16 = $.sibling(node_15, 2);

					Slider(node_16, {
						label: 'offsetY',
						min: -2,
						max: 2,
						step: 1,
						get value() {
							return $.get(textureOffsetY);
						},

						set value($$value) {
							$.set(textureOffsetY, $$value, true);
						}
					});

					var node_17 = $.sibling(node_16, 2);

					Slider(node_17, {
						label: 'repeatX',
						min: 0,
						max: 5,
						step: 1,
						get value() {
							return $.get(textureRepeatX);
						},

						set value($$value) {
							$.set(textureRepeatX, $$value, true);
						}
					});

					var node_18 = $.sibling(node_17, 2);

					Slider(node_18, {
						label: 'repeatY',
						min: 0,
						max: 5,
						step: 1,
						get value() {
							return $.get(textureRepeatY);
						},

						set value($$value) {
							$.set(textureRepeatY, $$value, true);
						}
					});

					var node_19 = $.sibling(node_18, 2);

					Slider(node_19, {
						label: 'rotation (degrees)',
						min: -360,
						max: 360,
						step: 1,
						get value() {
							return $.get(textureRotationDegrees);
						},

						set value($$value) {
							$.set(textureRotationDegrees, $$value, true);
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_20 = $.child(div);

	Canvas(node_20, {
		get toneMapping() {
			return $.get(sceneToneMapping);
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get gradientEndColor() {
					return $.get(gradientEndColor);
				},

				get gradientEndX() {
					return $.get(gradientEndX);
				},

				get gradientEndY() {
					return $.get(gradientEndY);
				},

				get gradientStartColor() {
					return $.get(gradientStartColor);
				},

				get gradientStartX() {
					return $.get(gradientStartX);
				},

				get gradientStartY() {
					return $.get(gradientStartY);
				},

				get sceneClearColor() {
					return $.get(sceneClearColor);
				},

				get textureCenterX() {
					return $.get(textureCenterX);
				},

				get textureCenterY() {
					return $.get(textureCenterY);
				},

				get textureOffsetX() {
					return $.get(textureOffsetX);
				},

				get textureOffsetY() {
					return $.get(textureOffsetY);
				},

				get textureRepeatX() {
					return $.get(textureRepeatX);
				},

				get textureRepeatY() {
					return $.get(textureRepeatY);
				},

				get textureRotation() {
					return $.get(textureRotation);
				},

				get textureWrapS() {
					return $.get(textureWrapS);
				},

				get textureWrapT() {
					return $.get(textureWrapT);
				},
				canvasSize
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}