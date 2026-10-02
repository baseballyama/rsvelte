import * as $ from 'svelte/internal/server';
import Comp from './diagnostics-ignore-generated-imported.svelte';

export default function Input($$renderer) {
	if (typeof a === 'string') {
		$$renderer.push(`<!--[0-->${$.escape(a === true)} <!--[-->`);

		const each_array = $.ensure_array_like([true]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let a = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(a === true)}`);
		}

		$$renderer.push(`<!--]--> `);

		if (b) {
			$$renderer.push(`<!--[0-->${$.escape(b)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);
	Comp($$renderer, { variant: 'food', style: `${1}` });
	$$renderer.push(`<!---->`);
}