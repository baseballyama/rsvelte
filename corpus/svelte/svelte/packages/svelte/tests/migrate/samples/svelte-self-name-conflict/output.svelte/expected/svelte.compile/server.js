import * as $ from 'svelte/internal/server';
import Output_1 from './output.svelte';

export default function Output_2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ [key: string]: any }} */
		let { $$slots, $$events, ...props } = $$props;

		let Output;

		if (false) {
			$$renderer.push('<!--[0-->');
			Output_1($$renderer, {});
			$$renderer.push(`<!----> `);
			Output_1($$renderer, { with_attributes: true });
			$$renderer.push(`<!----> `);
			Output_1($$renderer, { count: count + 1 });
			$$renderer.push(`<!----> `);

			Output_1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Output_1($$renderer, {
				count: count + 1,
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Output_1($$renderer, {
				count: props.count,
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Output_1($$renderer, {});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}