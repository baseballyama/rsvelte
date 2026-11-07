import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let exception = void 0;

	const onerror = (e) => {
		exception = e;
	};

	if (!exception) {
		$$renderer.push(`<!--[0--><p>condition is ${$.escape(String(!exception))}</p> `);
		$$renderer.push(`<!--[-->`);

		{
			Child($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (exception) {
		$$renderer.push(`<!--[0--><p>caught error: ${$.escape(exception)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}