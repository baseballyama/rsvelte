import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	Foo($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->test`);
		},
		$$slots: { default: true }
	});
}