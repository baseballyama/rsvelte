import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let isRed = true;
	const attributes = $.derived(() => ({ 'data-red': isRed ? true : undefined }));

	$$renderer.push(`<button>Toggle</button> <h1${$.attributes({ ...attributes() })}>Style: ${$.escape(isRed ? 'red' : 'not red')}</h1>`);
}