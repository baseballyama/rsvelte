import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Story, Source, Template } from '@storybook/addon-svelte-csf';
import { Button, Form, FormGroup, Input } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Validation',
	parameters: {},
	argTypes: {},
	args: {}
};

var root = $.from_html(`<div class="vertical form-width"><!> <!></div>`);
var root_1 = $.from_html(`<div class="form-width vertical"><!> <!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Validation_stories($$anchor) {
	let validated = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Template(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			FormGroup(node_1, {
				children: ($$anchor, $$slotProps) => {
					Input($$anchor, {
						value: 'Bad value',
						feedback: 'Invalid feedback',
						invalid: true
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			FormGroup(node_2, {
				children: ($$anchor, $$slotProps) => {
					Input($$anchor, {
						value: 'Correct value',
						feedback: 'Valid feedback',
						valid: true
					});
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Story(node_3, { name: 'Basic' });

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Dynanic',
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				get validated() {
					return validated;
				},
				$$events: { submit: (e) => e.preventDefault() },
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();
					var node_5 = $.child(div_1);

					FormGroup(node_5, {
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {
								feedback: 'This requires a value',
								placeholder: 'This requires a value',
								required: true
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					FormGroup(node_6, {
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {
								feedback: 'This requires an email',
								placeholder: 'This requires an email',
								required: true,
								type: 'email'
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						type: 'submit',
						$$events: { click: () => validated = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Fake Submit');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}