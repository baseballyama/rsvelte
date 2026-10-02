import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let handlerUndef;
	let handlerNull;
	let handlerInvalid;

	handlerUndef = undefined;
	handlerNull = null;
	handlerInvalid = 42;
	$$renderer.push(`<button>undef</button> <button>null</button> <button>invalid</button>`);
}