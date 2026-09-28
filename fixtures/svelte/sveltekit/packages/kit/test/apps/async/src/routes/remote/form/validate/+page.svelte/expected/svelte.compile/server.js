import * as $ from 'svelte/internal/server';
import { issue_path_form, my_form, my_form_2, unmount_form } from './form.remote.ts';
import * as v from 'valibot';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const schema = v.object({
			foo: v.picklist(['a', 'b', 'c']),
			bar: v.picklist(['d', 'e']),
			button: v.literal('submitter')
		});

		const unmount_schema = v.object({ qux: v.picklist(['a', 'b']) });
		let error = false;
		let mounted = true;
		let unmount_error = 'no error';

		$$renderer.push(`<form${$.attributes({ id: 'my-form', ...my_form.preflight(schema) })}><!--[-->`);

		const each_array = $.ensure_array_like(my_form.fields.foo.issues());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let issue = each_array[$$index];

			$$renderer.push(`<p>${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> <input${$.attributes({ ...my_form.fields.foo.as('text') }, void 0, void 0, void 0, 4)}/> <!--[-->`);

		const each_array_1 = $.ensure_array_like(my_form.fields.bar.issues());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let issue = each_array_1[$$index_1];

			$$renderer.push(`<p>${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> <input${$.attributes({ ...my_form.fields.bar.as('text') }, void 0, void 0, void 0, 4)}/> <button${$.attributes({ ...my_form.fields.button.as('submit', 'incorrect_value') })}>submit</button> <!--[-->`);

		const each_array_2 = $.ensure_array_like(my_form.fields.button.issues());

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let issue = each_array_2[$$index_2];

			$$renderer.push(`<p>${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> <button${$.attributes({ ...my_form.fields.button.as('submit', 'submitter') })}>submit (imperative validation)</button></form> <button id="trigger-validate">trigger validation</button> <form${$.attributes({ id: 'issue-path-form', ...issue_path_form })}><input${$.attributes({ ...issue_path_form.fields.nested.value.as('text') }, void 0, void 0, void 0, 4)}/> <button type="button" id="validate">Validate</button> <pre id="allIssues">${$.escape(JSON.stringify(issue_path_form.fields.allIssues()))}</pre></form> <form${$.attributes({
			id: 'my-form-2',
			...my_form_2.enhance(async ({ submit }) => {
				error = false;

				try {
					await submit();
				} catch {
					error = true;
				}
			})
		})}><!--[-->`);

		const each_array_3 = $.ensure_array_like(my_form_2.fields.baz.issues());

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let issue = each_array_3[$$index_3];

			$$renderer.push(`<p>${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> <input${$.attributes({ ...my_form_2.fields.baz.as('text') }, void 0, void 0, void 0, 4)}/> <p data-error="">${$.escape(error ? 'An error occurred' : 'No error')}</p> <button>submit</button></form> `);

		if (mounted) {
			$$renderer.push(`<!--[0--><form${$.attributes({
				id: 'unmount-form',
				...unmount_form.preflight(unmount_schema)
			})}><input${$.attributes({ ...unmount_form.fields.qux.as('text') }, void 0, void 0, void 0, 4)}/></form>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button id="unmount-then-validate">unmount then validate</button> <p id="unmount-error">${$.escape(unmount_error)}</p>`);
	});
}