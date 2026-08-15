import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label class="check"><input type="checkbox"/> </label>`);
var root_1 = $.from_html(`<form class="svelte-oeyshj"><label>Name <input/></label> <label>Email <input type="email"/></label> <label> <input type="range" min="13" max="99"/></label> <label>Bio <textarea rows="3"></textarea></label> <label>Plan <select><option>Free</option><option>Pro</option><option>Team</option></select></label> <fieldset><legend>Interests</legend> <!></fieldset> <fieldset><legend>Preferred contact</legend> <label><input type="radio"/> Email</label> <label><input type="radio"/> Phone</label></fieldset> <label class="check"><input type="checkbox"/> I agree to the terms</label> <p class="summary svelte-oeyshj"> </p> <button type="submit">Submit</button></form>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	let name = $.state('');
	let email = $.state('');
	let age = $.state(18);
	let bio = $.state('');
	let plan = $.state('free');
	let agree = $.state(false);
	let interests = $.state($.proxy([]));
	let contact = $.state('email');
	const options = ['sports', 'music', 'reading', 'travel', 'cooking'];
	let emailValid = $.derived(() => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/).test($.get(email)));
	let nameValid = $.derived(() => $.get(name).trim().length >= 2);
	let canSubmit = $.derived(() => $.get(nameValid) && $.get(emailValid) && $.get(agree));
	let summary = $.derived(() => `${$.get(name) || 'Anonymous'} <${$.get(email) || 'n/a'}> — ${$.get(plan)} plan, ${$.get(interests).length} interests`);

	function submit() {
		if (!$.get(canSubmit)) return;

		console.log($.get(summary));
	}

	var form = root_1();
	var label = $.child(form);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);

	let classes;

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);

	let classes_1;

	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var text = $.child(label_2);
	var input_2 = $.sibling(text);

	$.remove_input_defaults(input_2);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var textarea = $.sibling($.child(label_3));

	$.remove_textarea_child(textarea);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var select = $.sibling($.child(label_4));
	var option = $.child(select);

	option.value = option.__value = 'free';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'pro';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'team';
	$.reset(select);
	$.reset(label_4);

	var fieldset = $.sibling(label_4, 2);
	var node = $.sibling($.child(fieldset), 2);

	$.each(node, 17, () => options, $.index, ($$anchor, opt) => {
		var label_5 = root();
		var input_3 = $.child(label_5);

		$.remove_input_defaults(input_3);

		var input_3_value;
		var text_1 = $.sibling(input_3);

		$.reset(label_5);

		$.template_effect(() => {
			if (input_3_value !== (input_3_value = $.get(opt))) {
				input_3.value = (input_3.__value = $.get(opt)) ?? '';
			}

			$.set_text(text_1, ` ${$.get(opt) ?? ''}`);
		});

		$.bind_group(
			binding_group,
			[],
			input_3,
			() => {
				$.get(opt);

				return $.get(interests);
			},
			($$value) => $.set(interests, $$value)
		);

		$.append($$anchor, label_5);
	});

	$.reset(fieldset);

	var fieldset_1 = $.sibling(fieldset, 2);
	var label_6 = $.sibling($.child(fieldset_1), 2);
	var input_4 = $.child(label_6);

	$.remove_input_defaults(input_4);
	input_4.value = input_4.__value = 'email';
	$.next();
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_5 = $.child(label_7);

	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = 'phone';
	$.next();
	$.reset(label_7);
	$.reset(fieldset_1);

	var label_8 = $.sibling(fieldset_1, 2);
	var input_6 = $.child(label_8);

	$.remove_input_defaults(input_6);
	$.next();
	$.reset(label_8);

	var p = $.sibling(label_8, 2);
	var text_2 = $.child(p, true);

	$.reset(p);

	var button = $.sibling(p, 2);

	$.reset(form);

	$.template_effect(() => {
		classes = $.set_class(input, 1, 'svelte-oeyshj', null, classes, { invalid: $.get(name) && !$.get(nameValid) });
		classes_1 = $.set_class(input_1, 1, 'svelte-oeyshj', null, classes_1, { invalid: $.get(email) && !$.get(emailValid) });
		$.set_text(text, `Age: ${$.get(age) ?? ''} `);
		$.set_text(text_2, $.get(summary));
		button.disabled = !$.get(canSubmit);
	});

	$.event('submit', form, (e) => {
		e.preventDefault();
		submit();
	});

	$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
	$.bind_value(input_1, () => $.get(email), ($$value) => $.set(email, $$value));
	$.bind_value(input_2, () => $.get(age), ($$value) => $.set(age, $$value));
	$.bind_value(textarea, () => $.get(bio), ($$value) => $.set(bio, $$value));
	$.bind_select_value(select, () => $.get(plan), ($$value) => $.set(plan, $$value));
	$.bind_group(binding_group_1, [], input_4, () => $.get(contact), ($$value) => $.set(contact, $$value));
	$.bind_group(binding_group_1, [], input_5, () => $.get(contact), ($$value) => $.set(contact, $$value));
	$.bind_checked(input_6, () => $.get(agree), ($$value) => $.set(agree, $$value));
	$.append($$anchor, form);
	$.pop();
}
