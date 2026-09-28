import * as $ from 'svelte/internal/server';
import { get_value, set_value } from './form.remote.ts';
import * as v from 'valibot';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = get_value();
		const schema = v.object({ value: v.pipe(v.number(), v.maxValue(20, 'too big')) });

		// preflight().for() ordering — the bug: preflight was lost when chained before for
		const form = set_value.preflight(schema).for('a');

		$$renderer.push(`<p>value.current: ${$.escape(value.current)}</p> <form${$.attributes({ 'data-preflight-for': true, ...form })}><!--[-->`);

		const each_array = $.ensure_array_like(form.fields.value.issues());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let issue = each_array[$$index];

			$$renderer.push(`<p>${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> <input${$.attributes(
			{
				'data-preflight-for-input': true,
				...form.fields.value.as('number')
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <button>submit</button></form> <p data-preflight-for-pending="">form.pending: ${$.escape(form.pending)}</p> <p data-preflight-for-result="">form.result: ${$.escape(form.result)}</p>`);
	});
}