import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-g99s8o"><!></div>`, 1);

export default function App($$anchor) {
	let environmentIsBackground = $.state(true);
	let useEnvironment = $.state(true);
	let environmentInputsDisabled = $.derived(() => !$.get(useEnvironment));
	const extensions = { exr: 'exr', hdr: 'hdr', jpg: 'jpg' };

	const hdrFiles = {
		aerodynamics_workshop: 'aerodynamics_workshop_1k.hdr',
		industrial_sunset_puresky: 'industrial_sunset_puresky_1k.hdr',
		mpumalanga_veld_puresky: 'mpumalanga_veld_puresky_1k.hdr',
		shanghai_riverside: 'shanghai_riverside_1k.hdr'
	};

	const exrFiles = { piz_compressed: 'piz_compressed.exr' };
	const jpgFiles = { equirect_ruined_room: 'equirect_ruined_room.jpg' };
	let extension = $.state($.proxy(extensions.hdr));
	const extensionFilePath = $.derived(() => `/textures/equirectangular/${$.get(extension)}/`);
	let exrFile = $.state($.proxy(exrFiles.piz_compressed));
	let hdrFile = $.state($.proxy(hdrFiles.shanghai_riverside));
	let jpgFile = $.state($.proxy(jpgFiles.equirect_ruined_room));
	const extensionIsEXR = $.derived(() => $.get(extension) === 'exr');
	const extensionIsHDR = $.derived(() => $.get(extension) === 'hdr');

	const environmentFile = $.derived(() => $.get(extensionIsHDR)
		? $.get(hdrFile)
		: $.get(extensionIsEXR) ? $.get(exrFile) : $.get(jpgFile));

	let materialMetalness = $.state(1);
	let materialRoughness = $.state(0);
	const environmentUrl = $.derived(() => $.get(extensionFilePath) + $.get(environmentFile));
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Environment',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'use <Environment>',
				get value() {
					return $.get(useEnvironment);
				},

				set value($$value) {
					$.set(useEnvironment, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				get disabled() {
					return $.get(environmentInputsDisabled);
				},
				label: 'is background',
				get value() {
					return $.get(environmentIsBackground);
				},

				set value($$value) {
					$.set(environmentIsBackground, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			List(node_3, {
				get disabled() {
					return $.get(environmentInputsDisabled);
				},

				get options() {
					return extensions;
				},
				label: 'extension',
				get value() {
					return $.get(extension);
				},

				set value($$value) {
					$.set(extension, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					List($$anchor, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},

						get options() {
							return hdrFiles;
						},
						label: 'file',
						get value() {
							return $.get(hdrFile);
						},

						set value($$value) {
							$.set(hdrFile, $$value, true);
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					List($$anchor, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},

						get options() {
							return exrFiles;
						},
						label: 'file',
						get value() {
							return $.get(exrFile);
						},

						set value($$value) {
							$.set(exrFile, $$value, true);
						}
					});
				};

				var alternate = ($$anchor) => {
					List($$anchor, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},

						get options() {
							return jpgFiles;
						},
						label: 'file',
						get value() {
							return $.get(jpgFile);
						},

						set value($$value) {
							$.set(jpgFile, $$value, true);
						}
					});
				};

				$.if(node_4, ($$render) => {
					if ($.get(extensionIsHDR)) $$render(consequent); else if ($.get(extensionIsEXR)) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			Folder(node_5, {
				title: 'material props',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_6 = $.first_child(fragment_5);

					Slider(node_6, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},
						label: 'metalness',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(materialMetalness);
						},

						set value($$value) {
							$.set(materialMetalness, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Slider(node_7, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},
						label: 'roughness',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(materialRoughness);
						},

						set value($$value) {
							$.set(materialRoughness, $$value, true);
						}
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_8 = $.child(div);

	Canvas(node_8, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get environmentUrl() {
					return $.get(environmentUrl);
				},

				get environmentIsBackground() {
					return $.get(environmentIsBackground);
				},

				get materialMetalness() {
					return $.get(materialMetalness);
				},

				get materialRoughness() {
					return $.get(materialRoughness);
				},

				get useEnvironment() {
					return $.get(useEnvironment);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}