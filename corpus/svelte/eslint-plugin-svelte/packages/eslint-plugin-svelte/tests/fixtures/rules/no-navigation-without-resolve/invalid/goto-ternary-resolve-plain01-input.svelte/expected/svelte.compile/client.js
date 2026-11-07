import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_ternary_resolve_plain01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;

	goto(condition ? resolve('/foo') : '/bar');
	goto(condition ? '/foo' : resolve('/bar'));
	goto(condition ? '/foo' : '/bar');

	const url = condition ? resolve('/foo') : '/bar';

	goto(url);

	const plain = '/bar';

	goto(condition ? resolve('/foo') : plain);
	$.pop();
}