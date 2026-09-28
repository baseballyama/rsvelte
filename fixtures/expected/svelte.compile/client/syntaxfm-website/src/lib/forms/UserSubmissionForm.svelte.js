import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';
import { form_action } from '../form_action';
import { Turnstile } from 'svelte-turnstile';
import { env } from '$env/dynamic/public';
import InlineError from './InlineError.svelte';
import { UserSubmissionType } from '@prisma/client';

var root = $.from_html(`<div class="error status svelte-1s1w3qe"><p class="svelte-1s1w3qe"> </p> <p class="text-sm svelte-1s1w3qe"> </p></div>`);
var root_1 = $.from_html(`<div class="success status svelte-1s1w3qe"><p class="svelte-1s1w3qe">Success!</p> <p class="text-sm svelte-1s1w3qe"> </p></div>`);
var root_2 = $.from_html(`<!> <form action="?" method="post" class="svelte-1s1w3qe"><div class="input-group svelte-1s1w3qe"><label for="submission_type">Submission Type</label> <div class="input svelte-1s1w3qe"><!> <select name="submission_type" id="submission_type" class="svelte-1s1w3qe"><option>Potluck Question</option><option>👻🎃 Spooky Story Submission</option><option>Guest Suggestion</option><option>Show Feedback</option><option>💰 OSS Funding Suggestion</option><option>Other</option></select></div></div> <div class="input-group svelte-1s1w3qe"><div><label for="body">What's Up?</label> <p class="required svelte-1s1w3qe">Required</p></div> <div class="input svelte-1s1w3qe"><!> <textarea id="body" name="body" placeholder="What do you have to say? Write as much as you like!" required="" class="svelte-1s1w3qe"></textarea></div></div> <div class="input-group svelte-1s1w3qe"><label for="name">Name</label> <div class="input svelte-1s1w3qe"><!> <input type="text" id="name" name="name" placeholder="Name, @handle, or Alias" class="svelte-1s1w3qe"/></div></div> <div class="input-group svelte-1s1w3qe"><label for="email">Email</label> <div class="input svelte-1s1w3qe"><!> <input type="email" id="email" name="email" placeholder="Only if we need it" class="svelte-1s1w3qe"/></div></div> <div class="input-group turnstile svelte-1s1w3qe"><!></div> <button type="submit" class="svelte-1s1w3qe">Send</button></form>`, 1);

export default function UserSubmissionForm($$anchor, $$props) {
	$.push($$props, true);

	let reset = $.state(void 0);
	let selected_submission_type = $.prop($$props, 'selected_submission_type', 3, 'SPOOKY');
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var p = $.child(div);
			var text = $.only_child(p);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1);

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, `Shoot! ${$$props.form.message ?? ''}`);
				$.set_text(text_1, `Error: ${$$props.form.error ?? ''}`);
			});

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var p_2 = $.sibling($.child(div_1), 2);
			var text_2 = $.only_child(p_2, true);

			$.reset(div_1);
			$.template_effect(() => $.set_text(text_2, $$props.form.message));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.form?.error) $$render(consequent); else if ($$props.form?.status === 200) $$render(consequent_1, 1);
		});
	}

	var form_1 = $.sibling(node, 2);
	var div_2 = $.child(form_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(div_3);

	{
		let $0 = $.derived(() => $$props.form?.fieldErrors?.['submission_type']);

		InlineError(node_1, {
			get displayError() {
				return $.get($0);
			}
		});
	}

	var select = $.sibling(node_1, 2);
	var option = $.child(select);

	option.value = option.__value = 'POTLUCK';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'SPOOKY';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'GUEST';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'FEEDBACK';

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 'OSS';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'OTHER';
	$.reset(select);

	var select_value;

	$.init_select(select);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var node_2 = $.child(div_5);

	{
		let $0 = $.derived(() => $$props.form?.fieldErrors?.['body']);

		InlineError(node_2, {
			get displayError() {
				return $.get($0);
			}
		});
	}

	var textarea = $.sibling(node_2, 2);

	$.set_attribute(textarea, 'minlength', 25);
	$.set_attribute(textarea, 'maxlength', 15000);
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.sibling($.child(div_6), 2);
	var node_3 = $.child(div_7);

	{
		let $0 = $.derived(() => $$props.form?.fieldErrors?.['name']);

		InlineError(node_3, {
			get displayError() {
				return $.get($0);
			}
		});
	}

	var input = $.sibling(node_3, 2);

	$.set_attribute(input, 'maxlength', 100);
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var node_4 = $.child(div_9);

	{
		let $0 = $.derived(() => $$props.form?.fieldErrors?.['email']);

		InlineError(node_4, {
			get displayError() {
				return $.get($0);
			}
		});
	}

	var input_1 = $.sibling(node_4, 2);

	$.set_attribute(input_1, 'maxlength', 100);
	$.reset(div_9);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var node_5 = $.child(div_10);

	Turnstile(node_5, {
		appearance: 'interaction-only',
		get siteKey() {
			return env.PUBLIC_TURNSTILE_SITE_KEY;
		},

		get reset() {
			return $.get(reset);
		},

		set reset($$value) {
			$.set(reset, $$value, true);
		}
	});

	$.reset(div_10);
	$.next(2);
	$.reset(form_1);

	$.action(form_1, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => form_action(undefined, undefined, (data, context) => {
		if (data.status === 200) {
			return context?.formElement.reset();
		}

		if (data.error) {
			console.info('Resetting turnstile');
			$.get(reset)?.();
		}
	}));

	$.template_effect(() => {
		if (select_value !== (select_value = selected_submission_type())) {
			(
				select.value = (select.__value = select_value) ?? '',
				$.select_option(select, select_value)
			);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}