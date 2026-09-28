import * as $ from 'svelte/internal/server';
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

export default function App($$renderer) {
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
	let sceneClearColor = '#000000';
	let sceneToneMapping = AgXToneMapping;
	let gradientStartColor = '#ff00ff';
	let gradientEndColor = '#ffff00';
	let gradientStartX = 0;
	let gradientStartY = 0;
	let gradientEndX = 0;
	let gradientEndY = canvasSize;
	let textureCenterX = 0;
	let textureCenterY = 0;
	let textureOffsetX = 0;
	let textureOffsetY = 0;
	let textureRepeatX = 1;
	let textureRepeatY = 1;
	let textureRotationDegrees = 0;
	let textureWrapS = ClampToEdgeWrapping;
	let textureWrapT = ClampToEdgeWrapping;
	let textureRotation = $.derived(() => Math.PI / 180 * textureRotationDegrees);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			children: ($$renderer) => {
				List($$renderer, {
					options: toneMappingOptions,
					label: 'tone mapping',
					get value() {
						return sceneToneMapping;
					},

					set value($$value) {
						sceneToneMapping = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'clear color',
					get value() {
						return sceneClearColor;
					},

					set value($$value) {
						sceneClearColor = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'gradient props',
					children: ($$renderer) => {
						Color($$renderer, {
							label: 'start color',
							get value() {
								return gradientStartColor;
							},

							set value($$value) {
								gradientStartColor = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Color($$renderer, {
							label: 'end color',
							get value() {
								return gradientEndColor;
							},

							set value($$value) {
								gradientEndColor = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'start x',
							min: 0,
							max: canvasSize,
							step: 1,
							get value() {
								return gradientStartX;
							},

							set value($$value) {
								gradientStartX = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'start y',
							min: 0,
							max: canvasSize,
							step: 1,
							get value() {
								return gradientStartY;
							},

							set value($$value) {
								gradientStartY = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'end x',
							min: 0,
							max: canvasSize,
							step: 1,
							get value() {
								return gradientEndX;
							},

							set value($$value) {
								gradientEndX = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'end y',
							min: 0,
							max: canvasSize,
							step: 1,
							get value() {
								return gradientEndY;
							},

							set value($$value) {
								gradientEndY = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'texture props',
					children: ($$renderer) => {
						List($$renderer, {
							label: 'wrapS',
							options: wrappingOptions,
							get value() {
								return textureWrapS;
							},

							set value($$value) {
								textureWrapS = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						List($$renderer, {
							label: 'wrapT',
							options: wrappingOptions,
							get value() {
								return textureWrapT;
							},

							set value($$value) {
								textureWrapT = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'centerX',
							min: -0.5,
							max: 1.5,
							step: 0.5,
							get value() {
								return textureCenterX;
							},

							set value($$value) {
								textureCenterX = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'centerY',
							min: -0.5,
							max: 1.5,
							step: 0.5,
							get value() {
								return textureCenterY;
							},

							set value($$value) {
								textureCenterY = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'offsetX',
							min: -2,
							max: 2,
							step: 1,
							get value() {
								return textureOffsetX;
							},

							set value($$value) {
								textureOffsetX = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'offsetY',
							min: -2,
							max: 2,
							step: 1,
							get value() {
								return textureOffsetY;
							},

							set value($$value) {
								textureOffsetY = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'repeatX',
							min: 0,
							max: 5,
							step: 1,
							get value() {
								return textureRepeatX;
							},

							set value($$value) {
								textureRepeatX = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'repeatY',
							min: 0,
							max: 5,
							step: 1,
							get value() {
								return textureRepeatY;
							},

							set value($$value) {
								textureRepeatY = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'rotation (degrees)',
							min: -360,
							max: 360,
							step: 1,
							get value() {
								return textureRotationDegrees;
							},

							set value($$value) {
								textureRotationDegrees = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-9mzhna">`);

		Canvas($$renderer, {
			toneMapping: sceneToneMapping,
			children: ($$renderer) => {
				Scene($$renderer, {
					gradientEndColor,
					gradientEndX,
					gradientEndY,
					gradientStartColor,
					gradientStartX,
					gradientStartY,
					sceneClearColor,
					textureCenterX,
					textureCenterY,
					textureOffsetX,
					textureOffsetY,
					textureRepeatX,
					textureRepeatY,
					textureRotation: textureRotation(),
					textureWrapS,
					textureWrapT,
					canvasSize
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}