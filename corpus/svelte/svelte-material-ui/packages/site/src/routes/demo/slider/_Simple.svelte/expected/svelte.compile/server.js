import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Simple($$renderer) {
	let value = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<span style="padding-inline-end: 12px; width: max-content; display: block;">Amount of Wonder</span>`);
			}

			FormField($$renderer, {
				align: 'end',
				style: 'display: flex;',
				label,
				children: ($$renderer) => {
					Slider($$renderer, {
						style: 'flex-grow: 1;',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		if (value == 0) {
			$$renderer.push(`<!--[0--><p>No wonder.</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div>`);

		Button($$renderer, {
			onclick: () => value = 100,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Maximum Wonder!`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Value: ${$.escape(value)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}