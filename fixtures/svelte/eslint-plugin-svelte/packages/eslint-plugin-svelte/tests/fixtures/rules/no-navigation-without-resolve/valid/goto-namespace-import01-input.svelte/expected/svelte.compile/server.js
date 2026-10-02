import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto(paths.resolve('/foo/'));
	});
}