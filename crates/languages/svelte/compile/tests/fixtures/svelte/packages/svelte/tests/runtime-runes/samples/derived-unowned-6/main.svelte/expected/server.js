import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function run() {
		let cond = true;
		let a = "a";
		let b = "b";

		let c = $.derived(() => {
			console.log('computing');

			return cond ? a : b;
		});

		console.log(c());
		b = "bb";
		console.log(c());
		cond = false;
		console.log(c());
		a = "aaa";
		console.log(c());
	}

	$$renderer.push(`<button>RUN THE THING</button>`);
}