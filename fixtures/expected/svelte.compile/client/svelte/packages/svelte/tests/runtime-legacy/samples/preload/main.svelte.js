import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export function preload({ foo }) {
	return { bar: foo * 2 };
}

export default function Main($$anchor) {}