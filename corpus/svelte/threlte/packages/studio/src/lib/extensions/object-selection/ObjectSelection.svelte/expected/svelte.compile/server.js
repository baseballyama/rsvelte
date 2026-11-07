import * as $ from 'svelte/internal/server';
import { useThrelte } from '@threlte/core';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import RenderSelectedObjects from './RenderSelectedObjects.svelte';
import SelectRect from './SelectRect.svelte';
import SelectTweak from './SelectTweak.svelte';
import { objectSelectionScope } from './types.js';
import { useOnRemove } from '../../internal/useOnRemove.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { tick } from 'svelte';

export default function ObjectSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { createExtension } = useStudio();
		const { invalidate } = useThrelte();
		const studioObjectRegistry = useStudioObjectsRegistry();

		const extension = createExtension({
			scope: objectSelectionScope,
			state: ({ persist }) => ({
				selectedObjects: [],
				enabled: persist(false),
				mode: persist('tweak'),
				inUse: false
			}),

			actions: {
				selectObjects({ state }, objects) {
					state.selectedObjects = objects;
					invalidate();
				},

				clearSelection({ state }) {
					state.selectedObjects = [];
					invalidate();
				},

				addToSelection({ state }, objects) {
					for (let i = 0; i < objects.length; i++) {
						const obj = objects[i];

						const exists = state.selectedObjects.find((a) => {
							return a.uuid === obj.uuid;
						});

						if (exists === undefined) {
							state.selectedObjects.push(obj);
						}
					}

					invalidate();
				},

				removeFromSelection({ state }, objects) {
					state.selectedObjects = state.selectedObjects.filter((object) => !objects.includes(object));
					invalidate();
				},

				toggleSelection({ state }, objects) {
					const toAdd = objects.filter((object) => !state.selectedObjects.includes(object));
					const toRemove = objects.filter((object) => state.selectedObjects.includes(object));

					state.selectedObjects = [
						...state.selectedObjects.filter((object) => !toRemove.includes(object)),
						...toAdd
					];

					invalidate();
				},

				toggleEnabled({ state }) {
					state.enabled = !state.enabled;
				},

				setEnabled({ state }, enabled) {
					state.enabled = enabled;
				},

				setMode({ state }, mode) {
					state.mode = mode;

					if (mode === 'tweak') state.inUse = false;
				},

				toggleMode({ state }) {
					state.mode = state.mode === 'tweak' ? 'rect' : 'tweak';

					if (state.mode === 'tweak') state.inUse = false;
				},

				setInUse({ state }, inUse) {
					state.inUse = inUse;
				},

				setModeTweak({ state }) {
					state.mode = 'tweak';
				},

				setModeRect({ state }) {
					state.mode = 'rect';
				}
			},

			keyMap() {
				return { toggleMode: 'a' };
			}
		});

		useOnRemove(async (object) => {
			await tick();

			if (studioObjectRegistry.isOrIsChildOfStudioObject(object)) return;

			extension.removeFromSelection([object]);
		});

		if (extension.state.mode === 'tweak') {
			$$renderer.push('<!--[0-->');
			SelectTweak($$renderer, {});
		} else if (extension.state.mode === 'rect') {
			$$renderer.push('<!--[1-->');
			SelectRect($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		RenderSelectedObjects($$renderer, {});
		$$renderer.push(`<!----> `);

		ToolbarItem($$renderer, {
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							label: 'Select Tweak',
							onclick: () => {
								extension.setMode('tweak');
							},
							active: extension.state.mode === 'tweak',
							icon: 'mdiCursorPointer',
							tooltip: 'Tweak Selection (A)'
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							label: 'Select Box',
							onclick: () => {
								extension.setMode('rect');
							},
							active: extension.state.mode === 'rect',
							icon: 'mdiSelect',
							tooltip: 'Box Selection (A)'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}