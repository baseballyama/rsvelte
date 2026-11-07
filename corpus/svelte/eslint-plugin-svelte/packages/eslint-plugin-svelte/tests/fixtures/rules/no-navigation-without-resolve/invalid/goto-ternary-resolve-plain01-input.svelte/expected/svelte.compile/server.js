import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_ternary_resolve_plain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		goto(condition ? resolve('/foo') : '/bar');
		goto(condition ? '/foo' : resolve('/bar'));
		goto(condition ? '/foo' : '/bar');

		const url = condition ? resolve('/foo') : '/bar';

		goto(url);

		const plain = '/bar';

		goto(condition ? resolve('/foo') : plain);
	});
}