import * as $ from 'svelte/internal/server';
import Select, { Option } from '@smui/select';
import Button, { Label } from '@smui/button';

export default function _Forms($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = '';
	let received = void 0;

	function handleSubmit(e) {
		e.preventDefault();
		received = e.currentTarget['fruit'].value;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins"><form>`);

		Select($$renderer, {
			label: 'Fruit',
			hiddenInput: true,
			input$name: 'fruit',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Option($$renderer, { value: '' });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(fruits);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let fruit = each_array[$$index];

					Option($$renderer, {
						value: fruit,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(fruit)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'submit',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form> <div style="margin-top: 1em;"><pre class="status">Received: ${$.escape(received != null ? received : 'Not submitted yet.')}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}