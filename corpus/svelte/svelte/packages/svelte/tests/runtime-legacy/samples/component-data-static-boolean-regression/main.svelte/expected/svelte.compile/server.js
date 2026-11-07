import * as $ from 'svelte/internal/server';
import Link from './Link.svelte';

export default function Main($$renderer) {
	Link($$renderer, { x: true, href: '/cool' });
}