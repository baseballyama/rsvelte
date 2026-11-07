import * as $ from 'svelte/internal/server';

export default function Video_bindings($$renderer) {
	let clip = 'https://5ad4a01a-eb56-49a7-b0a7-a9e4bed9c1aa.mdnplay.dev/shared-assets/videos/flower.webm';
	let currentTime = 0;
	let duration = 0;
	let paused = true;

	$$renderer.push(`<div class="container"><div class="example svelte-7vj7zx"><video${$.attr('src', clip)} class="svelte-7vj7zx"></video> <div class="controls svelte-7vj7zx"><button>${$.escape(paused ? '▶️' : '⏸️')}</button> <span>${$.escape(currentTime.toFixed(1))}/${$.escape(duration.toFixed(1))}</span> <input type="range"${$.attr('value', currentTime)}${$.attr('max', duration)}${$.attr('step', 0.1)} class="svelte-7vj7zx"/></div></div></div>`);
}