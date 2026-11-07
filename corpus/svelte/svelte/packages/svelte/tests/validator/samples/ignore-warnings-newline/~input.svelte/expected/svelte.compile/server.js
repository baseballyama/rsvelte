import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><img src="this-is-fine.jpg"/> <marquee>but this is still discouraged</marquee></div> <img src="potato.jpg"/>`);
}