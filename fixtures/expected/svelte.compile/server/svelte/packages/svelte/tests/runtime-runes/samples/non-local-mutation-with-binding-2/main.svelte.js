import * as $ from 'svelte/internal/server';
import Intermediate from './Intermediate.svelte';

export default function Main($$renderer) {
	let object = { count: 0 };

	Intermediate($$renderer, { object });
}