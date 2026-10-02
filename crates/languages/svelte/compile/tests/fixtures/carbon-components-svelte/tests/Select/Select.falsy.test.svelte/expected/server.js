import * as $ from 'svelte/internal/server';
import Select from "carbon-components-svelte/Select/Select.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";

export default function Select_falsy_test($$renderer) {
	Select($$renderer, {
		labelText: 'Falsy text',
		children: ($$renderer) => {
			SelectItem($$renderer, { value: -1, text: '' });
			$$renderer.push(`<!----> `);
			SelectItem($$renderer, { value: 0, text: 'Zero' });
			$$renderer.push(`<!----> `);
			SelectItem($$renderer, { value: 1, text: 'One' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Select($$renderer, {
		labelText: 'Undefined text',
		children: ($$renderer) => {
			SelectItem($$renderer, { value: 2 });
			$$renderer.push(`<!----> `);
			SelectItem($$renderer, { value: 0, text: 'Zero' });
			$$renderer.push(`<!----> `);
			SelectItem($$renderer, { value: 1, text: 'One' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}