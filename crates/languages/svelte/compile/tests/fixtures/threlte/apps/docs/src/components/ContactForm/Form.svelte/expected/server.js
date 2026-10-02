import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Button from '../Button/Button.svelte';
import { Toast } from './toast';
import { Fieldset } from './fields';

export default function Form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			action,
			submitButton = 'submit',
			method = 'post',
			id = action,
			onsubmit,
			children
		} = $$props;

		let open = writable(false);
		let type = 'info';
		let title = '';
		let message = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form${$.attr('id', id)}${$.attr('method', method)} class="svelte-6t7hek">`);
			children?.($$renderer);
			$$renderer.push(`<!----> `);

			Fieldset($$renderer, {
				align: 'right',
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'pl-4',
						children: ($$renderer) => {
							$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M223.69,42.18l-58.22,192a8,8,0,0,1-14.92,1.25L110,149.81a8,8,0,0,0-3.8-3.8L20.58,105.45a8,8,0,0,1,1.25-14.92l192-58.22A8,8,0,0,1,223.69,42.18Z" opacity="0.2"></path><path d="M227.32,28.68a16,16,0,0,0-15.66-4.08l-.15,0L19.57,82.84a16,16,0,0,0-2.42,29.84l85.62,40.55,40.55,85.62A15.86,15.86,0,0,0,157.74,248q.69,0,1.38-.06a15.88,15.88,0,0,0,14-11.51l58.2-191.94c0-.05,0-.1,0-.15A16,16,0,0,0,227.32,28.68ZM157.83,231.85l-.05.14L118.42,148.9l47.24-47.25a8,8,0,0,0-11.31-11.31L107.1,137.58,24,98.22l.14,0L216,40Z"></path></svg>${$.escape(submitButton)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toast($$renderer, {
						type,
						title,
						message,
						get open() {
							return $.store_get($$store_subs ??= {}, '$open', open);
						},

						set open($$value) {
							$.store_set(open, $$value);
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}