import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const attrs = {};

	$$renderer.push(`<i${$.attributes({ ...attrs })}></i>`);
}