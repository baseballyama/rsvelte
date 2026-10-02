import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div role="tooltip"></div> <div role="button tooltip"></div> <div role="toooltip"></div> <div role="button toooltip"></div>`);
}