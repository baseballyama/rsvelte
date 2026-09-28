import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	if (Component) {
		$$renderer.push('<!--[-->');
		Component($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}