import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div classname="abc"></div> <label htmlfor="i"><input/></label>`);
}