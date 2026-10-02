import * as $ from 'svelte/internal/server';
import { readable, writable } from 'svelte/store';

export default function Test02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		readable(false, function () {});
		readable(false, (foo) => function () {});
		writable(false, () => function () {});
		writable(false, (foo) => function () {});
	});
}