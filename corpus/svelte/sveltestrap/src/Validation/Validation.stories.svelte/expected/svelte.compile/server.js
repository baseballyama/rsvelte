import * as $ from 'svelte/internal/server';
import { Story, Source, Template } from '@storybook/addon-svelte-csf';
import { Button, Form, FormGroup, Input } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Validation',
	parameters: {},
	argTypes: {},
	args: {}
};

export default function Validation_stories($$renderer) {
	let validated = false;

	Template($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="vertical form-width">`);

			FormGroup($$renderer, {
				children: ($$renderer) => {
					Input($$renderer, {
						value: 'Bad value',
						feedback: 'Invalid feedback',
						invalid: true
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FormGroup($$renderer, {
				children: ($$renderer) => {
					Input($$renderer, {
						value: 'Correct value',
						feedback: 'Valid feedback',
						valid: true
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Dynanic',
		children: ($$renderer) => {
			Form($$renderer, {
				validated,
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width vertical">`);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								feedback: 'This requires a value',
								placeholder: 'This requires a value',
								required: true
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								feedback: 'This requires an email',
								placeholder: 'This requires an email',
								required: true,
								type: 'email'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fake Submit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}