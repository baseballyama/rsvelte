import * as $ from 'svelte/internal/server';

export default function Component($$renderer) {
	$$renderer.push(`<!---->component`);
}