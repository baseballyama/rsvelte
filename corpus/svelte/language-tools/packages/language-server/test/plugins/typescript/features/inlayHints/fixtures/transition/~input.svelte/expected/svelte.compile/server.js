import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Input($$renderer) {
	$$renderer.push(`<div></div> <div></div> <div></div> <div></div>`);
}