import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from './components/Chart.svelte';

var root = $.from_html(`<main><!></main>`);

export default function App($$anchor) {
	var main = root();
	var node = $.child(main);

	Chart(node, {});
	$.reset(main);
	$.append($$anchor, main);
}