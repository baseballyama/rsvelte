import * as $ from 'svelte/internal/server';
import InnerView from './InnerView.svelte';

export default function View($$renderer, $$props) {
	let { dom, scene, children } = $$props;

	if (dom) {
		$$renderer.push('<!--[0-->');

		InnerView($$renderer, {
			dom,
			scene,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}