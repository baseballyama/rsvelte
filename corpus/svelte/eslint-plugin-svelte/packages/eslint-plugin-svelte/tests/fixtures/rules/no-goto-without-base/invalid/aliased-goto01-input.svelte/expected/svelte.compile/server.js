import * as $ from 'svelte/internal/server';
import { goto as alias } from '$app/navigation';

export default function Aliased_goto01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		alias('/foo');
	});
}