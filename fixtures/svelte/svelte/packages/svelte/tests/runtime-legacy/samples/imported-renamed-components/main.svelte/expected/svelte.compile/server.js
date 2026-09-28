import * as $ from 'svelte/internal/server';
import ComponentOne from './ComponentOne.svelte';
import ComponentTwo from './ComponentTwo.svelte';

export default function Main($$renderer) {
	const RenamedComponentOne = ComponentOne;
	const RenamedComponentTwo = ComponentTwo;

	RenamedComponentOne($$renderer, {});
	$$renderer.push(`<!---->`);
	RenamedComponentTwo($$renderer, {});
	$$renderer.push(`<!---->`);
}