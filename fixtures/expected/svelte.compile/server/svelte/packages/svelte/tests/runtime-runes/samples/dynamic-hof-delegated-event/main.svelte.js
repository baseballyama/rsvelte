import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let hof = (name) => () => console.log('A' + name);
	const member = $.derived(() => ({ hof }));

	function change() {
		hof = (name) => () => console.log('B' + name);
	}

	$$renderer.push(`<button>A</button> <button>B</button> <br/> <button>change</button>`);
}