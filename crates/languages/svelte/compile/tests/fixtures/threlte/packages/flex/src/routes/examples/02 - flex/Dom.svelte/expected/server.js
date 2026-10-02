import * as $ from 'svelte/internal/server';

export default function Dom($$renderer) {
	$$renderer.push(`<div class="red" style="width: 500px; height: 500px; display: flex;"><div class="yellow" style="width: 100px; height: 100px;"></div> <div class="blue" style="width: 100px; height: 100px; flex: 1"></div></div>`);
}