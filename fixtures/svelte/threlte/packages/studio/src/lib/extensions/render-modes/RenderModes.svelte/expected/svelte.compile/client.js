import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrelte } from '@threlte/core';
import { onDestroy } from 'svelte';

import {
	BackSide,
	DoubleSide,
	FrontSide,
	Material,
	MeshBasicMaterial,
	MeshMatcapMaterial
} from 'three';

import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import { renderModesScope } from './types.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function RenderModes($$anchor, $$props) {
	$.push($$props, true);

	const hasMaterial = (object) => {
		return 'material' in object;
	};

	const { createExtension } = useStudio();
	const { scene, invalidate, renderer } = useThrelte();

	const extension = createExtension({
		scope: renderModesScope,
		state: ({ persist }) => ({ renderMode: persist('rendered') }),
		actions: {
			cycleRenderMode({ state }) {
				state.renderMode = state.renderMode === 'wireframe'
					? 'solid'
					: state.renderMode === 'solid' ? 'rendered' : 'wireframe';
			},

			setRenderMode({ state }, mode) {
				state.renderMode = mode;
			}
		},

		keyMap() {
			return { cycleRenderMode: 'v' };
		}
	});

	// override to exclude objects with `ignoreOverrideMaterial` from being rendered with the override material
	// see https://github.com/mrdoob/three.js/blob/45498d0255abe5da8d3ff95c117ccab594c49b8f/src/renderers/WebGLRenderer.js#L1589-L1616
	const ogRenderBufferDirect = renderer.renderBufferDirect.bind(renderer);

	renderer.renderBufferDirect = (...args) => {
		// signature: 0:camera, 1:scene, 2:geometry, 3:material, 4:object, 5:group
		if (args[4].userData.ignoreOverrideMaterial && hasMaterial(args[4])) {
			// we have to mimic what `renderObject` does with the original material
			const material = args[4].material;

			if (material.transparent && material.side === DoubleSide && !material.forceSinglePass) {
				material.side = BackSide;
				material.needsUpdate = true;
				ogRenderBufferDirect.call(renderer, args[0], args[1], args[2], material, args[4], args[5]);
				material.side = FrontSide;
				material.needsUpdate = true;
				ogRenderBufferDirect.call(renderer, args[0], args[1], args[2], material, args[4], args[5]);
				material.side = DoubleSide;
			} else {
				ogRenderBufferDirect.call(renderer, args[0], args[1], args[2], material, args[4], args[5]);
			}
		} else {
			ogRenderBufferDirect.call(renderer, ...args);
		}
	};

	onDestroy(() => {
		renderer.renderBufferDirect = ogRenderBufferDirect;
	});

	$.user_effect(() => {
		switch (extension.state.renderMode) {
			case 'rendered':
				{
					scene.overrideMaterial = null;

					break;
				}

			case 'wireframe':
				{
					scene.overrideMaterial = new MeshBasicMaterial({ wireframe: true, color: '#ffffff' });

					break;
				}

			case 'solid':
				{
					scene.overrideMaterial = new MeshMatcapMaterial({ color: '#ffffff', flatShading: true });

					break;
				}
		}

		invalidate();
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => extension.state.renderMode === 'wireframe');

						ToolbarButton(node_1, {
							label: 'Wireframe',
							icon: 'mdiWeb',
							onclick: () => {
								extension.setRenderMode('wireframe');
							},

							get active() {
								return $.get($0);
							},
							tooltip: 'Wireframe (V)'
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => extension.state.renderMode === 'solid');

						ToolbarButton(node_2, {
							label: 'Solid',
							icon: 'mdiCircle',
							onclick: () => {
								extension.setRenderMode('solid');
							},

							get active() {
								return $.get($0);
							},
							tooltip: 'Solid (V)'
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => extension.state.renderMode === 'rendered');

						ToolbarButton(node_3, {
							label: 'Rendered',
							icon: 'mdiCircleOpacity',
							onclick: () => {
								extension.setRenderMode('rendered');
							},

							get active() {
								return $.get($0);
							},
							tooltip: 'Rendered (V)'
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	$.snippet(node_4, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}