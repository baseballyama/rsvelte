import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_ternary_resolve_plain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		replaceState(condition ? resolve('/foo') : '/bar');
		replaceState(condition ? '/foo' : resolve('/bar'));
		replaceState(condition ? '/foo' : '/bar');

		const url = condition ? resolve('/foo') : '/bar';

		replaceState(url);

		const plain = '/bar';

		replaceState(condition ? resolve('/foo') : plain);
	});
}