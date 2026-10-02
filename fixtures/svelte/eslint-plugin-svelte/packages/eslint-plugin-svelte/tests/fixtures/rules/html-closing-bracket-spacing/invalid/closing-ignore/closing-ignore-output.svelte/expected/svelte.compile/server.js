import * as $ from 'svelte/internal/server';

export default function Closing_ignore_output($$renderer) {
	$$renderer.push(`<p>Hello</p> <div></div> <div></div>`);
}