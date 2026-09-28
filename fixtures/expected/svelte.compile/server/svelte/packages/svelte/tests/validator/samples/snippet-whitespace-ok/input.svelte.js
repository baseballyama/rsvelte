import * as $ from 'svelte/internal/server';

function ok($$renderer) {
	$$renderer.push(`<!---->asd`);
}

export default function Input($$renderer) {}