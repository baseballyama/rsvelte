import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div data-one="1" data-two="2" data-three="3"></div> <span data-one="1"></span>`);
}