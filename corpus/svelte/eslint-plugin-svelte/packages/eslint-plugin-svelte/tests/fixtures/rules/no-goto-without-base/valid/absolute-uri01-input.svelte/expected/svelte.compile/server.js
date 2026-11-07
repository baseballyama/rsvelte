import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Absolute_uri01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto('http://localhost/foo/');
		goto('https://localhost/foo/');
		goto('mailto:user@example.com');
		goto('tel:+123456789');
	});
}