import * as $ from 'svelte/internal/server';
import { fade, fly } from 'svelte/transition';

export default function Transition01_input($$renderer) {
	$$renderer.push(`<span>Hello World!</span> <span>Hello World!</span>`);
}