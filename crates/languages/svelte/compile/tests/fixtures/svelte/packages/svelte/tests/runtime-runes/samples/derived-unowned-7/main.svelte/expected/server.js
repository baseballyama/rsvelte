import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function run() {
		let a = 'a';

		let b = $.derived(() => {
			console.log('computing B', a);

			return 'foo';
		});

		let c = $.derived(() => {
			console.log('computing C');

			return b();
		});

		console.log(c());
		a = "aaa";
		console.log(c());
	}

	$$renderer.push(`<button>RUN THE THING</button>`);
}