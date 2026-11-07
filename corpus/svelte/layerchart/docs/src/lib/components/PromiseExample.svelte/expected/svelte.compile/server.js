import * as $ from 'svelte/internal/server';
import { Code } from '@layerstack/docs/components';

export default function PromiseExample($$renderer, $$props) {
	let { component, name } = $$props;
	const componentPromise = import(`../../examples/${component}/${name}.svelte`);
	const sourcePromise = import(`../../examples/${component}/${name}.svelte?raw`);

	$.await(
		$$renderer,
		componentPromise,
		() => {
			$$renderer.push(`<p>Loading component...</p>`);
		},
		(module) => {
			if (module.default) {
				$$renderer.push('<!--[-->');
				module.default($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		sourcePromise,
		() => {
			$$renderer.push(`<p>Loading source...</p>`);
		},
		(source) => {
			Code($$renderer, { source: source.default });
		}
	);

	$$renderer.push(`<!--]-->`);
}