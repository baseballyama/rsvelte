import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<span>Style: <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a>.</span>`);
}