import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	const object = { property: Component };

	function not_hoisted($$renderer) {
		if (object.property) {
			$$renderer.push('<!--[-->');
			object.property($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	not_hoisted($$renderer);
}