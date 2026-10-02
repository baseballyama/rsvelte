import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_plain01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;

	pushState(condition ? resolve('/foo') : '/bar');
	pushState(condition ? '/foo' : resolve('/bar'));
	pushState(condition ? '/foo' : '/bar');

	const url = condition ? resolve('/foo') : '/bar';

	pushState(url);

	const plain = '/bar';

	pushState(condition ? resolve('/foo') : plain);
	$.pop();
}