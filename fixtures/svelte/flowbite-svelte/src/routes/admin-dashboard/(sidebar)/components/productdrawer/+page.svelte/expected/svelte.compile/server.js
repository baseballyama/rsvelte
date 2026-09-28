import * as $ from 'svelte/internal/server';
import * as ExampleComponents from "./examples";

export default function _page($$renderer) {
	if (ExampleComponents.Example1) {
		$$renderer.push('<!--[-->');
		ExampleComponents.Example1($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}