import * as $ from 'svelte/internal/server';

export default function Main_server($$renderer) {
	$$renderer.push(`${$.html('Server')}`);
}