import * as $ from 'svelte/internal/server';
import logo from './logo.png?enhanced';

export default function Image($$renderer) {
	$$renderer.push(`<enhanced:img id="birds" src="./birds.jpg" alt="birds"></enhanced:img> <enhanced:img id="playwright" src="./playwright-logo.svg" alt="Playwright logo"></enhanced:img> <enhanced:img id="logo"${$.attr('src', logo)} alt="Svelte logo"></enhanced:img>`);
}