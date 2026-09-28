import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EditorCamera from '../extensions/editor-camera/EditorCamera.svelte';
import Grid from '../extensions/grid/Grid.svelte';
import Helpers from '../extensions/helpers/Helpers.svelte';
import Inspector from '../extensions/inspector/Inspector.svelte';
import ObjectSelection from '../extensions/object-selection/ObjectSelection.svelte';
import RenderModes from '../extensions/render-modes/RenderModes.svelte';
import SceneHierarchy from '../extensions/scene-hierarchy/SceneHierarchy.svelte';
import Snapping from '../extensions/snapping/Snapping.svelte';
import Space from '../extensions/space/Space.svelte';
import StaticState from '../extensions/static-state/StaticState.svelte';
import StudioObjectsRegistry from '../extensions/studio-objects-registry/StudioObjectsRegistry.svelte';
import Transactions from '../extensions/transactions/Transactions.svelte';
import TransformControls from '../extensions/transform-controls/TransformControls.svelte';
import { createRootContext, useStudio } from '../internal/extensions.js';
import NestedComponents from './NestedComponents.svelte';
import Toolbar from './Toolbar.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Studio($$anchor, $$props) {
	$.push($$props, true);

	let namespace = $.prop($$props, 'namespace', 3, 'default'),
		transient = $.prop($$props, 'transient', 3, false);

	createRootContext(namespace(), transient());

	const { createExtension } = useStudio();

	const defaultExtensions = [
		Transactions,
		StudioObjectsRegistry,
		ObjectSelection,
		Space,
		Snapping,
		TransformControls,
		EditorCamera,
		RenderModes,
		Grid,
		Helpers,
		SceneHierarchy,
		Inspector,
		StaticState
	];

	const allExtensions = [...defaultExtensions, ...$$props.extensions ?? []];

	// TODO: this is a bit of a hack, but it works for now
	const studioExtension = createExtension({
		scope: 'studio',
		state: ({ persist }) => ({ enabled: persist(true) }),
		actions: {
			toggle: ({ state }) => {
				state.enabled = !state.enabled;

				if (!state.enabled) {
					// we need a hard reload here
					window.location.reload();
				}
			}
		},

		keyMap({ alt, shift }) {
			return { toggle: shift(alt('s')) };
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Toolbar(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			NestedComponents(node_2, {
				get extensions() {
					return allExtensions;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $$props.children);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			$.snippet(node_4, () => $$props.children);
			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (studioExtension.state.enabled) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}