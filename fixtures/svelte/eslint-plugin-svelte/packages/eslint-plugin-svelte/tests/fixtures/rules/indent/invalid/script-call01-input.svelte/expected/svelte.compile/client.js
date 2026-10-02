import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_call01_input($$anchor, $$props) {
	$.push($$props, true);
	a();
	b.c(a, { b });
	a?.(b);
	new A();
	new A(a, b);
	new A();
	$.pop();
}