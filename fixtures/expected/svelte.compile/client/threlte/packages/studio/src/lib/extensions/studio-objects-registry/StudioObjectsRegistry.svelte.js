import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import { useStudio } from '../../internal/extensions.js';
import { studioObjectsRegistryScope } from './types.js';

export default function StudioObjectsRegistry($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();

	createExtension({
		scope: studioObjectsRegistryScope,
		state() {
			return { objects: new SvelteSet() };
		},

		actions: {
			addObject({ state }, object) {
				state.objects.add(object);
			},

			removeObject({ state }, object) {
				state.objects.delete(object);
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}