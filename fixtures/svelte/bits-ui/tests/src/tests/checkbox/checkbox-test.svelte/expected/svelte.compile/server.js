import * as $ from 'svelte/internal/server';
import { Checkbox } from "bits-ui";

export default function Checkbox_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			checked = false,
			onFormSubmit,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><form method="POST"><p data-testid="binding">${$.escape(checked)}</p> `);

			{
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span data-testid="indicator">`);

					if (indeterminate) {
						$$renderer.push(`<!--[0-->indeterminate`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(checked)}`);
					}

					$$renderer.push(`<!--]--></span>`);
				}

				if (Checkbox.Root) {
					$$renderer.push('<!--[-->');

					Checkbox.Root($$renderer, $.spread_props([
						{ name: 'terms', 'data-testid': 'root' },
						restProps,
						{
							get checked() {
								return checked;
							},

							set checked($$value) {
								checked = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` <button type="submit" data-testid="submit">Submit</button></form></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}