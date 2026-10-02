import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const ping = {};

	ping.pong = { ping, pang: 'hello!' };
	$$renderer.push(`<button>${$.escape(ping.pong.ping.pong.ping.pong.pang)}</button>`);
}