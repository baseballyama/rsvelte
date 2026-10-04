import * as $ from 'svelte/internal/server';

import "./custom-button.js";

export default function Options_custom_extended_builtin($$renderer) {
	$$renderer.push(`<button is="custom-button">Click</button>`);
}
