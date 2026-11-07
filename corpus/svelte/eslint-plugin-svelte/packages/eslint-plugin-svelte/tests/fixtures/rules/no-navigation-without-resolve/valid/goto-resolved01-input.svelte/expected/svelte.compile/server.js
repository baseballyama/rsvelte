import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_resolved01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = resolve('/foo/');

		goto(resolve('/foo/'));
		goto(value);
	});
}