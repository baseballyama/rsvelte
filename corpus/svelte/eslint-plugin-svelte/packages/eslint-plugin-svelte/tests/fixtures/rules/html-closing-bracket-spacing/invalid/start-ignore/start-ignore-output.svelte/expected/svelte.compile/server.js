import * as $ from 'svelte/internal/server';

export default function Start_ignore_output($$renderer) {
	$$renderer.push(`<p>Hello</p> <p>Hi</p> <div></div>`);
}