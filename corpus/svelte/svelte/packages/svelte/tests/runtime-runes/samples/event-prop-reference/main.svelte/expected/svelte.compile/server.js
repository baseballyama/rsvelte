import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item } = $$props;

		function onclick() {
			console.log(item?.name);
		}

		$$renderer.push(`<button>${$.escape(item?.name)}</button>`);
	});
}