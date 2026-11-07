import * as $ from 'svelte/internal/server';

export default function End_ignore_output($$renderer) {
	$$renderer.push(`<p>Hello</p> <p>Hi</p> <div></div>`);
}