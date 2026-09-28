import * as $ from 'svelte/internal/server';
import NestedComponents from './NestedComponents.svelte';

export default function NestedComponents_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { extensions, children } = $$props;
		const Extension = extensions[0];
		const nextExtensions = extensions.slice(1);

		Extension($$renderer, {
			children: ($$renderer) => {
				if (nextExtensions.length > 0) {
					$$renderer.push('<!--[0-->');

					NestedComponents($$renderer, {
						extensions: nextExtensions,
						children: ($$renderer) => {
							children($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}