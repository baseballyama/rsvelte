import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div>red</div> <div class="foo">bold/blue</div>`);
}