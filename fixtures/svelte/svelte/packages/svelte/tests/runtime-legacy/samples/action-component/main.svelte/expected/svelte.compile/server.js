import * as $ from 'svelte/internal/server';
import Component from "./sub.svelte";

export default function Main($$renderer) {
	let state = 'foo';
	let param = '';

	function action(node, _param) {
		param = _param;

		return {
			update(_param) {
				param = _param;
			}
		};
	}

	$$renderer.push(`<button>${$.escape(state)} / ${$.escape(param)}</button> `);
	Component($$renderer, { action, state });
	$$renderer.push(`<!---->`);
}