import * as $ from 'svelte/internal/server';

export default function Main_client($$renderer) {
	$$renderer.push(`${$.html('<p>Client</p> <span>has more nodes so if we would walk this because we think it is static we would get an error</span>')}`);
}