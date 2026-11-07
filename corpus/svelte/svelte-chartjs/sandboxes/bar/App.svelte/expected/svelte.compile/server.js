import * as $ from 'svelte/internal/server';
import Chart from './components/Chart.svelte';

export default function App($$renderer) {
	$$renderer.push(`<main>`);
	Chart($$renderer, {});
	$$renderer.push(`<!----></main>`);
}