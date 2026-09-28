import * as $ from 'svelte/internal/server';
import * as NS from 'some-library';

export default function Input($$renderer) {
	if (NS.Foo) {
		$$renderer.push('<!--[-->');
		NS.Foo($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}