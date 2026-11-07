import * as $ from 'svelte/internal/server';

export default function Async01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { custom } = $$props;

		void custom();
	});
}