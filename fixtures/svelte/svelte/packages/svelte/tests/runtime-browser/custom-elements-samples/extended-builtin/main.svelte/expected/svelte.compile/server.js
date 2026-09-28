import * as $ from 'svelte/internal/server';
import "./custom-button.js";

export default function Main($$renderer) {
	$$renderer.push(`<button is="custom-button">click me</button>`);
}