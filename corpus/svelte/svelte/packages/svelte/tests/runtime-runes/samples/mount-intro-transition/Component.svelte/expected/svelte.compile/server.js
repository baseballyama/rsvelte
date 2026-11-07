import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Component($$renderer) {
	$$renderer.push(`<div>DIV</div>`);
}