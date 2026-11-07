import * as $ from 'svelte/internal/server';
import { enhance, applyAction } from "$app/forms";
import { page } from "$app/stores";

export default function Settings_module($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const fieldError = (liveForm, name) => {
			let errors = liveForm?.errorFields ?? [];

			return errors.includes(name);
		};

		// Page state
		let loading = false;

		let showSuccess = false;

		// default is "text"
		// Module context
		let {
			editable = false,
			dangerous = false,
			title = "",
			message = "",
			fields,
			formTarget = "",
			successTitle = "Success",
			successBody = "",
			editButtonTitle = null,
			editLink = null,
			saveButtonTitle = "Save"
		} = $$props;

		const handleSubmit = () => {
			loading = true;

			return async ({ update, result }) => {
				await update({ reset: false });
				await applyAction(result);
				loading = false;

				if (result.type === "success") {
					showSuccess = true;
				}
			};
		};

		$$renderer.push(`<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm">`);

		if (title) {
			$$renderer.push(`<!--[0--><div class="text-xl font-bold mb-3 w-48 md:pr-8 flex-none">${$.escape(title)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="w-full min-w-48">`);

		if (!showSuccess) {
			$$renderer.push('<!--[0-->');

			if (message) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`mb-6 ${dangerous ? 'alert alert-warning' : ''}`)}>`);

				if (dangerous) {
					$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span>${$.escape(message)}</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form class="form-widget flex flex-col" method="POST"${$.attr('action', formTarget)}><!--[-->`);

			const each_array = $.ensure_array_like(fields);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let field = each_array[$$index];

				if (field.label) {
					$$renderer.push(`<!--[0--><label${$.attr('for', field.id)}><span class="text-sm text-gray-500">${$.escape(field.label)}</span></label>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (editable) {
					$$renderer.push(`<!--[0--><input${$.attr('id', field.id)}${$.attr('name', field.id)}${$.attr('type', field.inputType ?? "text")}${$.attr('disabled', !editable, true)}${$.attr('placeholder', field.placeholder ?? field.label ?? "")}${$.attr_class(`${fieldError($.store_get($$store_subs ??= {}, '$page', page)?.form, field.id) ? 'input-error' : ''} input-sm mt-1 input input-bordered w-full max-w-xs mb-3 text-base py-4`)}${$.attr('value', $.store_get($$store_subs ??= {}, '$page', page).form
						? $.store_get($$store_subs ??= {}, '$page', page).form[field.id]
						: field.initialValue)}${$.attr('maxlength', field.maxlength ? field.maxlength : null)}/>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="text-lg mb-3">${$.escape(field.initialValue)}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if ($.store_get($$store_subs ??= {}, '$page', page)?.form?.errorMessage) {
				$$renderer.push(`<!--[0--><p class="text-red-700 text-sm font-bold mt-1">${$.escape($.store_get($$store_subs ??= {}, '$page', page)?.form?.errorMessage)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (editable) {
				$$renderer.push(`<!--[0--><div><button type="submit"${$.attr_class(`ml-auto btn btn-sm mt-3 min-w-[145px] ${dangerous ? 'btn-error' : 'btn-primary btn-outline'}`)}${$.attr('disabled', loading, true)}>`);

				if (loading) {
					$$renderer.push(`<!--[0--><span class="loading loading-spinner loading-md align-middle mx-3"></span>`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(saveButtonTitle)}`);
				}

				$$renderer.push(`<!--]--></button></div>`);
			} else if (editButtonTitle && editLink) {
				$$renderer.push(`<!--[1--><a${$.attr('href', editLink)} class="mt-1"><button${$.attr_class(`btn btn-outline btn-sm ${dangerous ? 'btn-error' : ''} min-w-[145px]`)}>${$.escape(editButtonTitle)}</button></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></form>`);
		} else {
			$$renderer.push(`<!--[-1--><div><div class="text-l font-bold">${$.escape(successTitle)}</div> <div class="text-base">${$.escape(successBody)}</div></div> <a href="/account/settings"><button class="btn btn-outline btn-sm mt-3 min-w-[145px]">Return to Settings</button></a>`);
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}