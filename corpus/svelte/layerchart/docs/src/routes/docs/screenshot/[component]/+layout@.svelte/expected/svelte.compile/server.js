import * as $ from 'svelte/internal/server';
import { examples } from '@layerstack/docs/context';

export default function _layout_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		// Add examples to context for Example component to use
		const examplesContext = {
			get current() {
				return data.examples;
			}
		};

		examples.set(examplesContext);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}