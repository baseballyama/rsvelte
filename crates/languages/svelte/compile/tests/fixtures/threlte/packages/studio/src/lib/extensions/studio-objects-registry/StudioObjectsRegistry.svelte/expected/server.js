import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import { useStudio } from '../../internal/extensions.js';
import { studioObjectsRegistryScope } from './types.js';

export default function StudioObjectsRegistry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
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

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}