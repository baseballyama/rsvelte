import * as $ from 'svelte/internal/server';

export default function ComponentB($$renderer) {
	$$renderer.push(`<div>b</div>`);
}