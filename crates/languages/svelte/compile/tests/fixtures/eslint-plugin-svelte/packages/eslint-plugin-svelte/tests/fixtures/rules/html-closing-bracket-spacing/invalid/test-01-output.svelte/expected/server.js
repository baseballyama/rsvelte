import * as $ from 'svelte/internal/server';

export default function Test_01_output($$renderer) {
	$$renderer.push(`<p>Hello</p> <div></div> <div></div>`);
}