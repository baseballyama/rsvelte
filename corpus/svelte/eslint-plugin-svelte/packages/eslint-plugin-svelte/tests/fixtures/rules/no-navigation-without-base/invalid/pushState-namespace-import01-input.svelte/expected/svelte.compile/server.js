import * as $ from 'svelte/internal/server';
import * as navigation from '$app/navigation';

export default function PushState_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		navigation.pushState('/foo');
	});
}