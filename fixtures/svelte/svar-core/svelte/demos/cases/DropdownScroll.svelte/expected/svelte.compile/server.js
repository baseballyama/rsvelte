import * as $ from 'svelte/internal/server';
import { Field, DatePicker } from "../../src/index";

export default function DropdownScroll($$renderer) {
	$$renderer.push(`<div class="demo-box"><h3>DatePicker in a scrollable container.</h3> <p>Click to show and scroll the container. <b>trackScroll</b> closes dropdown
		on scroll</p> <p>`);

	Field($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="container svelte-1ozhjsx" style="height: 150px;overflow: auto;"><div style="width:100%;height:700px;">`);
			DatePicker($$renderer, { dropdown: { trackScroll: true } });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></p> <p><b>inline</b> dropdown mode</p> <p>`);

	Field($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="container svelte-1ozhjsx" style="height: 150px;overflow: auto;"><div style="width:100%;height:700px;">`);
			DatePicker($$renderer, { dropdown: { inline: true } });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></p></div>`);
}