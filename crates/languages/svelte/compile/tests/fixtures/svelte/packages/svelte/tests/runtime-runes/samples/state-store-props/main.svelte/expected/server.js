import * as $ from 'svelte/internal/server';
import Page from './Component.svelte';

export default function Main($$renderer) {
	let data = { form: { data: { tags: { first: 1, second: 2 } } } };

	Page($$renderer, { data });
}