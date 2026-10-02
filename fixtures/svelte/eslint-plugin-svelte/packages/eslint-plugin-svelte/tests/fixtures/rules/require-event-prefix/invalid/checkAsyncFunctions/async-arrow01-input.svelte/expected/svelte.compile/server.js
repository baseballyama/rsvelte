import * as $ from 'svelte/internal/server';

export default function Async_arrow01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { custom } = $$props;

		void custom();
	});
}