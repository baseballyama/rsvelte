import * as $ from 'svelte/internal/server';
import { create } from './form.remote.ts';
import * as v from 'valibot';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const passing_schema = v.pipeAsync(v.object({ name: v.string() }), v.checkAsync(
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 500));

				return true;
			},
			'async check failed'
		));

		const failing_schema = v.pipeAsync(v.object({ name: v.string() }), v.checkAsync(
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 500));

				return false;
			},
			'async check failed'
		));

		const passing = create.for('passing');
		const failing = create.for('failing');

		$$renderer.push(`<form${$.attributes({ 'data-passing': true, ...passing.preflight(passing_schema) })}><input${$.attributes({ ...passing.fields.name.as('text'), value: 'test' }, void 0, void 0, void 0, 4)}/> <button>submit passing</button></form> <p data-passing-pending="">passing pending: ${$.escape(passing.pending)}</p> <p data-passing-result="">passing result: ${$.escape(passing.result)}</p> <hr/> <form${$.attributes({ 'data-failing': true, ...failing.preflight(failing_schema) })}><input${$.attributes({ ...failing.fields.name.as('text'), value: 'test' }, void 0, void 0, void 0, 4)}/> <button>submit failing</button></form> <p data-failing-pending="">failing pending: ${$.escape(failing.pending)}</p> <!--[-->`);

		const each_array = $.ensure_array_like(failing.fields.allIssues());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let issue = each_array[$$index];

			$$renderer.push(`<p data-failing-issue="">${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}