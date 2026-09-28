import * as $ from 'svelte/internal/server';
import { RadioButtonGroup, CheckboxGroup, Select, Text } from "@svar-ui/svelte-core";
import { getData } from "../data";

export default function RadioCheckboxes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { SVR, core } = getData();

		$$renderer.push(`<div class="column svelte-1b19rd6">`);
		RadioButtonGroup($$renderer, { options: SVR, value: 2 });
		$$renderer.push(`<!----> `);
		Text($$renderer, { type: "number", value: 1 });
		$$renderer.push(`<!----> `);

		Select($$renderer, {
			value: "",
			options: SVR,
			label: "name",
			placeholder: "Options"
		});

		$$renderer.push(`<!----> <div class="checkbox-group svelte-1b19rd6">`);
		CheckboxGroup($$renderer, { options: core, value: [1, 2, 3, 6, 7, 8] });
		$$renderer.push(`<!----></div></div>`);
	});
}