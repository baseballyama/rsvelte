import * as $ from 'svelte/internal/server';
import { Button } from "../../src/index";
import { getContext } from "svelte";

export default function Buttons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showNotice } = getContext("wx-helpers");

		function onclick() {
			showNotice({ text: "Button clicked" });
		}

		$$renderer.push(`<div class="demo-box"><h3>Default button</h3> `);

		Button($$renderer, {
			onclick,
			title: 'Click me and I will do nothing',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Primary button</h3> `);

		Button($$renderer, {
			type: 'primary',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Secondary button</h3> `);

		Button($$renderer, {
			type: 'secondary',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'secondary',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Danger button</h3> `);

		Button($$renderer, {
			type: 'danger',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'danger',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Link button</h3> <p>`);

		Button($$renderer, {
			type: 'link',
			icon: 'wxi-alert',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <p>`);

		Button($$renderer, {
			type: 'link',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <p>`);

		Button($$renderer, {
			type: 'link',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p></div> <div class="demo-box"><h3>Block buttons</h3> <p>`);

		Button($$renderer, {
			type: 'primary block',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <p>`);

		Button($$renderer, {
			type: 'secondary block',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <div style="display:flex;">`);

		Button($$renderer, {
			type: 'secondary block',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->   `);

		Button($$renderer, {
			type: 'primary block',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Icon buttons</h3> <div class="demo-row">`);

		Button($$renderer, {
			icon: 'wxi-alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			icon: 'wxi-alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'secondary',
			icon: 'wxi-alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Button($$renderer, { icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { type: 'primary', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { type: 'secondary', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { type: 'danger', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		Button($$renderer, { disabled: true, icon: 'wxi-alert' });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Multi-line button</h3> <p>`);

		Button($$renderer, {
			type: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click me<br/>a few times`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p></div>`);
	});
}