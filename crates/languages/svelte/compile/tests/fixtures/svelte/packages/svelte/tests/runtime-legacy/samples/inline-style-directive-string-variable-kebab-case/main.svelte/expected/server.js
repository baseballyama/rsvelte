import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let url = "https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png";
	let alpha = 1;

	$$renderer.push(`<div${$.attr_style('', {
		'background-image': 'url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png)',
		'--css-variable': 'rgba(0, 0, 0, 1)'
	})}></div>`);
}