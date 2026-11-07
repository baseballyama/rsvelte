import * as $ from 'svelte/internal/server';

export function preload({ foo }) {
	return { bar: foo * 2 };
}

export default function Main($$renderer) {}