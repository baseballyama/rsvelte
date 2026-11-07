import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Foo($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}