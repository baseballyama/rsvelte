import * as $ from 'svelte/internal/server';
import { applyAction, enhance } from "$app/forms";
import "../../../../app.css";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let user = $.derived(() => data.user);
		let profile = $.derived(() => data.profile);
		let loading = false;
		let fullName = $.derived(() => profile()?.full_name ?? "");
		let companyName = $.derived(() => profile()?.company_name ?? "");
		let website = $.derived(() => profile()?.website ?? "");

		const fieldError = (liveForm, name) => {
			let errors = liveForm?.errorFields ?? [];

			return errors.includes(name);
		};

		const handleSubmit = () => {
			loading = true;

			return async ({ update, result }) => {
				await update({ reset: false });
				await applyAction(result);
				loading = false;
			};
		};

		$.head('jtffe2', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Create Profile</title>`);
			});
		});

		$$renderer.push(`<div class="text-center content-center max-w-lg mx-auto min-h-[100vh] pb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80"><div><h1 class="text-2xl font-bold mb-6">Create Profile</h1> <form class="form-widget" method="POST" action="/account/api?/updateProfile"><div class="mt-4"><label for="fullName"><span class="text-l text-center">Your Name</span></label> <input id="fullName" name="fullName" type="text" placeholder="Your full name"${$.attr_class(`${fieldError(form, 'fullName') ? 'input-error' : ''} mt-1 input input-bordered w-full max-w-xs`)}${$.attr('value', form?.fullName ?? fullName())} maxlength="50"/></div> <div class="mt-4"><label for="companyName"><span class="text-l text-center">Company Name</span></label> <input id="companyName" name="companyName" type="text" placeholder="Company name"${$.attr_class(`${fieldError(form, 'companyName') ? 'input-error' : ''} mt-1 input input-bordered w-full max-w-xs`)}${$.attr('value', form?.companyName ?? companyName())} maxlength="50"/></div> <div class="mt-4"><label for="website"><span class="text-l text-center">Company Website</span></label> <input id="website" name="website" type="text" placeholder="Company website"${$.attr_class(`${fieldError(form, 'website') ? 'input-error' : ''} mt-1 input input-bordered w-full max-w-xs`)}${$.attr('value', form?.website ?? website())} maxlength="50"/></div> `);

		if (form?.errorMessage) {
			$$renderer.push(`<!--[0--><p class="text-red-700 text-sm font-bold text-center mt-3">${$.escape(form?.errorMessage)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="mt-4"><input type="submit" class="btn btn-primary mt-3 btn-wide"${$.attr('value', loading ? "..." : "Create Profile")}${$.attr('disabled', loading, true)}/></div></form> <div class="text-sm text-slate-800 mt-14">You are logged in as ${$.escape(user()?.email)}. <br/> <a class="underline" href="/account/sign_out">Sign out</a></div></div></div></div>`);
	});
}