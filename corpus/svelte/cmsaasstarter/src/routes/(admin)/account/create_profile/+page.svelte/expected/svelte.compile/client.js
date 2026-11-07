import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { applyAction, enhance } from "$app/forms";
import "../../../../app.css";

var root = $.from_html(`<p class="text-red-700 text-sm font-bold text-center mt-3"> </p>`);
var root_1 = $.from_html(`<div class="text-center content-center max-w-lg mx-auto min-h-[100vh] pb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80"><div><h1 class="text-2xl font-bold mb-6">Create Profile</h1> <form class="form-widget" method="POST" action="/account/api?/updateProfile"><div class="mt-4"><label for="fullName"><span class="text-l text-center">Your Name</span></label> <input id="fullName" name="fullName" type="text" placeholder="Your full name" maxlength="50"/></div> <div class="mt-4"><label for="companyName"><span class="text-l text-center">Company Name</span></label> <input id="companyName" name="companyName" type="text" placeholder="Company name" maxlength="50"/></div> <div class="mt-4"><label for="website"><span class="text-l text-center">Company Website</span></label> <input id="website" name="website" type="text" placeholder="Company website" maxlength="50"/></div> <!> <div class="mt-4"><input type="submit" class="btn btn-primary mt-3 btn-wide"/></div></form> <div class="text-sm text-slate-800 mt-14"> <br/> <a class="underline" href="/account/sign_out">Sign out</a></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let user = $.derived(() => $$props.data.user);
	let profile = $.derived(() => $$props.data.profile);
	let loading = $.state(false);
	let fullName = $.derived(() => $.get(profile)?.full_name ?? "");
	let companyName = $.derived(() => $.get(profile)?.company_name ?? "");
	let website = $.derived(() => $.get(profile)?.website ?? "");

	const fieldError = (liveForm, name) => {
		let errors = liveForm?.errorFields ?? [];

		return errors.includes(name);
	};

	const handleSubmit = () => {
		$.set(loading, true);

		return async ({ update, result }) => {
			await update({ reset: false });
			await applyAction(result);
			$.set(loading, false);
		};
	};

	var div = root_1();

	$.head('jtffe2', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Create Profile';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form_1 = $.sibling($.child(div_2), 2);
	var div_3 = $.child(form_1);
	var input = $.sibling($.child(div_3), 2);

	$.remove_input_defaults(input);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var input_1 = $.sibling($.child(div_4), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var input_2 = $.sibling($.child(div_5), 2);

	$.remove_input_defaults(input_2);
	$.reset(div_5);

	var node = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.form?.errorMessage));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.form?.errorMessage) $$render(consequent);
		});
	}

	var div_6 = $.sibling(node, 2);
	var input_3 = $.child(div_6);

	$.remove_input_defaults(input_3);
	$.reset(div_6);
	$.reset(form_1);
	$.action(form_1, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => handleSubmit);

	var div_7 = $.sibling(form_1, 2);
	var text_1 = $.child(div_7);

	$.next(3);
	$.reset(div_7);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(input, 1, `${$0 ?? ''} mt-1 input input-bordered w-full max-w-xs`);
			$.set_value(input, $$props.form?.fullName ?? $.get(fullName));
			$.set_class(input_1, 1, `${$1 ?? ''} mt-1 input input-bordered w-full max-w-xs`);
			$.set_value(input_1, $$props.form?.companyName ?? $.get(companyName));
			$.set_class(input_2, 1, `${$2 ?? ''} mt-1 input input-bordered w-full max-w-xs`);
			$.set_value(input_2, $$props.form?.website ?? $.get(website));
			$.set_value(input_3, $.get(loading) ? "..." : "Create Profile");
			input_3.disabled = $.get(loading);
			$.set_text(text_1, `You are logged in as ${$.get(user)?.email ?? ''}. `);
		},
		[
			() => fieldError($$props.form, 'fullName') ? 'input-error' : '',
			() => fieldError($$props.form, 'companyName') ? 'input-error' : '',
			() => fieldError($$props.form, 'website') ? 'input-error' : ''
		]
	);

	$.append($$anchor, div);
	$.pop();
}