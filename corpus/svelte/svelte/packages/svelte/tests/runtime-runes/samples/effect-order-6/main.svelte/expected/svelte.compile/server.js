import * as $ from 'svelte/internal/server';
import A from './A.svelte';

export default function Main($$renderer) {
	let object = void 0;

	function open() {
		object = { boolean: true };
	}

	function close() {
		object = undefined;
	}

	let closed = false;

	$$renderer.push(`<button>open</button> <button>close</button> <hr/> `);

	if (object) {
		$$renderer.push('<!--[0-->');
		A($$renderer, { closed, close, boolean: object.boolean });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}