import * as $ from 'svelte/internal/server';
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

export default function Studio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			extensions,
			children,
			namespace = 'default',
			transient = false
		} = $$props;

		createRootContext(namespace, transient);

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

		const allExtensions = [...defaultExtensions, ...extensions ?? []];

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

		if (studioExtension.state.enabled) {
			$$renderer.push('<!--[0-->');
			Toolbar($$renderer, {});
			$$renderer.push(`<!----> `);

			NestedComponents($$renderer, {
				extensions: allExtensions,
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}