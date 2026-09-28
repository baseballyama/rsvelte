import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let toggle = false;

	function action(element) {
		const handle = () => {
			console.log('failed');
		};

		element.addEventListener('click', handle);

		return {
			update(toggle) {
				if (toggle) {
					element.removeEventListener('click', handle);
				}
			}
		};
	}

	$$renderer.push(`<button>click me</button>`);
}