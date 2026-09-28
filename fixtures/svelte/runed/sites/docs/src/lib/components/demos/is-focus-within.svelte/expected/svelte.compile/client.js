import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsFocusWithin } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<form class="mx-auto flex max-w-[340px] flex-col gap-4 p-4"><div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div> <!></form> <p class="mx-auto mt-6 text-center">Focus is within form: <b> </b></p>`, 1);

export default function Is_focus_within($$anchor, $$props) {
	$.push($$props, true);

	let formElement = $.state(void 0);
	const formFocused = new IsFocusWithin(() => $.get(formElement));

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var form = $.first_child(fragment_1);
			var div = $.child(form);
			var node = $.child(div);

			Label(node, {
				for: 'fname',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, { id: 'fname' });
			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			Label(node_2, {
				for: 'lname',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Last name');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, { id: 'lname' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			Label(node_4, {
				for: 'email',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Email');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Input(node_5, { id: 'email', type: 'email' });
			$.reset(div_2);

			var node_6 = $.sibling(div_2, 2);

			Button(node_6, {
				type: 'submit',
				variant: 'brand',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Submit');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.bind_this(form, ($$value) => $.set(formElement, $$value), () => $.get(formElement));

			var p = $.sibling(form, 2);
			var b = $.sibling($.child(p));
			var text_4 = $.only_child(b, true);

			$.reset(p);

			$.template_effect(() => {
				$.set_class(b, 1, $.clsx(formFocused.current ? "text-emerald-500" : "text-destructive"));
				$.set_text(text_4, formFocused.current);
			});

			$.event('submit', form, (e) => {
				e.preventDefault();
				$.get(formElement)?.reset();
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}