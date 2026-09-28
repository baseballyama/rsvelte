import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p${$.attributes({ ...{ id: "my-id", style: "width: 65px" } }, void 0, void 0, { color: 'blue' })}></p>`);
}