import * as $ from 'svelte/internal/server';
import * as navigation from '$app/navigation';

export default function ReplaceState_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		navigation.replaceState('/foo');
	});
}