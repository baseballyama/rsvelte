import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (foo ? Foo : Bar) {
		$$renderer.push('<!--[-->');
		(foo ? Foo : Bar)($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}