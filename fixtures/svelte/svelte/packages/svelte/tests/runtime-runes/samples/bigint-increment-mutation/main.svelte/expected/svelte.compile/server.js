import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let object = { n: 0n };

	function reassign() {
		object = { n: 0n };
	}

	function mutate() {
		return object.n++;
	}

	$$renderer.push(`<button>mutate</button> <button>reassign</button> <p>${$.escape(object.n)}</p>`);
}