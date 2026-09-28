import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<video src="x"><track kind="captions"/></video> <video src="x"></video> <video src="x"><track/></video> <audio></audio> <video src="x" aria-hidden="true"></video> <video src="x" aria-hidden="false"></video> <video></video>`);
}