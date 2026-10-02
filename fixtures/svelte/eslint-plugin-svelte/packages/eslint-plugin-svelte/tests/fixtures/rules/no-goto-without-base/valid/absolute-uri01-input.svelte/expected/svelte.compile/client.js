import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Absolute_uri01_input($$anchor, $$props) {
	$.push($$props, true);
	goto('http://localhost/foo/');
	goto('https://localhost/foo/');
	goto('mailto:user@example.com');
	goto('tel:+123456789');
	$.pop();
}