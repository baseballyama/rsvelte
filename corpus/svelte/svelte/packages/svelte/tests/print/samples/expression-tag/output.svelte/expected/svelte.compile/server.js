import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<span>${$.escape(name)}</span> <span>${$.escape(count + 1)}</span>`);
}