import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let environmentIsBackground = true;
	let useEnvironment = true;
	let environmentInputsDisabled = $.derived(() => !useEnvironment);
	const extensions = { exr: 'exr', hdr: 'hdr', jpg: 'jpg' };

	const hdrFiles = {
		aerodynamics_workshop: 'aerodynamics_workshop_1k.hdr',
		industrial_sunset_puresky: 'industrial_sunset_puresky_1k.hdr',
		mpumalanga_veld_puresky: 'mpumalanga_veld_puresky_1k.hdr',
		shanghai_riverside: 'shanghai_riverside_1k.hdr'
	};

	const exrFiles = { piz_compressed: 'piz_compressed.exr' };
	const jpgFiles = { equirect_ruined_room: 'equirect_ruined_room.jpg' };
	let extension = extensions.hdr;
	const extensionFilePath = $.derived(() => `/textures/equirectangular/${extension}/`);
	let exrFile = exrFiles.piz_compressed;
	let hdrFile = hdrFiles.shanghai_riverside;
	let jpgFile = jpgFiles.equirect_ruined_room;
	const extensionIsEXR = $.derived(() => extension === 'exr');
	const extensionIsHDR = $.derived(() => extension === 'hdr');
	const environmentFile = $.derived(() => extensionIsHDR() ? hdrFile : extensionIsEXR() ? exrFile : jpgFile);
	let materialMetalness = 1;
	let materialRoughness = 0;
	const environmentUrl = $.derived(() => extensionFilePath() + environmentFile());
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Environment',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'use <Environment>',
					get value() {
						return useEnvironment;
					},

					set value($$value) {
						useEnvironment = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: environmentInputsDisabled(),
					label: 'is background',
					get value() {
						return environmentIsBackground;
					},

					set value($$value) {
						environmentIsBackground = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					disabled: environmentInputsDisabled(),
					options: extensions,
					label: 'extension',
					get value() {
						return extension;
					},

					set value($$value) {
						extension = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				if (extensionIsHDR()) {
					$$renderer.push('<!--[0-->');

					List($$renderer, {
						disabled: environmentInputsDisabled(),
						options: hdrFiles,
						label: 'file',
						get value() {
							return hdrFile;
						},

						set value($$value) {
							hdrFile = $$value;
							$$settled = false;
						}
					});
				} else if (extensionIsEXR()) {
					$$renderer.push('<!--[1-->');

					List($$renderer, {
						disabled: environmentInputsDisabled(),
						options: exrFiles,
						label: 'file',
						get value() {
							return exrFile;
						},

						set value($$value) {
							exrFile = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');

					List($$renderer, {
						disabled: environmentInputsDisabled(),
						options: jpgFiles,
						label: 'file',
						get value() {
							return jpgFile;
						},

						set value($$value) {
							jpgFile = $$value;
							$$settled = false;
						}
					});
				}

				$$renderer.push(`<!--]--> `);

				Folder($$renderer, {
					title: 'material props',
					children: ($$renderer) => {
						Slider($$renderer, {
							disabled: environmentInputsDisabled(),
							label: 'metalness',
							min: 0,
							max: 1,
							step: 0.1,
							get value() {
								return materialMetalness;
							},

							set value($$value) {
								materialMetalness = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							disabled: environmentInputsDisabled(),
							label: 'roughness',
							min: 0,
							max: 1,
							step: 0.1,
							get value() {
								return materialRoughness;
							},

							set value($$value) {
								materialRoughness = $$value;
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

		$$renderer.push(`<!----> <div class="svelte-g99s8o">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					environmentUrl: environmentUrl(),
					environmentIsBackground,
					materialMetalness,
					materialRoughness,
					useEnvironment
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