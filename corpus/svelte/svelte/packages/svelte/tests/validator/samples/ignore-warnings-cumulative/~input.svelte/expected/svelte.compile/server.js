import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><figure><img src="potato.jpg"/> <marquee><figcaption>potato</figcaption></marquee></figure> <figure><img src="potato.jpg"/> <marquee><figcaption>potato</figcaption></marquee></figure></div>`);
}