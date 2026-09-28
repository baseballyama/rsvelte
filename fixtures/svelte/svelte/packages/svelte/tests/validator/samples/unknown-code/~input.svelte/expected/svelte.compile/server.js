import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><img src="this-is-fine.jpg"/></div> <div><img src="this-is-fine.jpg"/></div> <div scope=""></div> <div scope=""></div> <div scope=""></div>`);
}