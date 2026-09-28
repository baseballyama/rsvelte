import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ObjectSelection($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			SelectTweak($$anchor, {});
		};

		var consequent_1 = ($$anchor) => {
			SelectRect($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (extension.state.mode === 'tweak') $$render(consequent); else if (extension.state.mode === 'rect') $$render(consequent_1, 1);
		});
	}

	var node_1 = $.sibling(node, 2);

	RenderSelectedObjects(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	ToolbarItem(node_2, {
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_3 = $.first_child(fragment_4);

					{
						let $0 = $.derived(() => extension.state.mode === 'tweak');

						ToolbarButton(node_3, {
							label: 'Select Tweak',
							onclick: () => {
								extension.setMode('tweak');
							},

							get active() {
								return $.get($0);
							},
							icon: 'mdiCursorPointer',
							tooltip: 'Tweak Selection (A)'
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => extension.state.mode === 'rect');

						ToolbarButton(node_4, {
							label: 'Select Box',
							onclick: () => {
								extension.setMode('rect');
							},

							get active() {
								return $.get($0);
							},
							icon: 'mdiSelect',
							tooltip: 'Box Selection (A)'
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	$.snippet(node_5, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}