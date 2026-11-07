import * as $ from 'svelte/internal/server';

export default function Script_call01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		a();
		b.c(a, { b });
		a?.(b);
		new A();
		new A(a, b);
		new A();
	});
}