import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_plain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		pushState(condition ? resolve('/foo') : '/bar');
		pushState(condition ? '/foo' : resolve('/bar'));
		pushState(condition ? '/foo' : '/bar');

		const url = condition ? resolve('/foo') : '/bar';

		pushState(url);

		const plain = '/bar';

		pushState(condition ? resolve('/foo') : plain);
	});
}