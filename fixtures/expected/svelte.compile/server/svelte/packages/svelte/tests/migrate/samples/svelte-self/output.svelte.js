import * as $ from 'svelte/internal/server';
import Output from './output.svelte';

export default function Output_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ [key: string]: any }} */
		let { $$slots, $$events, ...props } = $$props;

		if (false) {
			$$renderer.push('<!--[0-->');
			Output($$renderer, {});
			$$renderer.push(`<!----> `);
			Output($$renderer, { with_attributes: true });
			$$renderer.push(`<!----> `);
			Output($$renderer, { count: count + 1 });
			$$renderer.push(`<!----> `);

			Output($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Output($$renderer, {
				count: count + 1,
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Output($$renderer, {
				count: props.count,
				children: ($$renderer) => {
					$$renderer.push(`<!---->child`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Output($$renderer, {});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}