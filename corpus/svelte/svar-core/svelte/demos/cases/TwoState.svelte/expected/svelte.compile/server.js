import * as $ from 'svelte/internal/server';
import { TwoState } from "../../src/index";
import { getContext } from "svelte";

export default function TwoState_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showNotice } = getContext("wx-helpers");

		function onclick() {
			showNotice({ text: "TwoState clicked" });
		}

		function active($$renderer) {
			$$renderer.push(`<span slot="active">Working...</span>`);
		}

		$$renderer.push(`<div class="demo-box"><h3>Default TwoState Button</h3> `);

		TwoState($$renderer, {
			onclick,
			active,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Primary TwoState Button</h3> `);

		TwoState($$renderer, {
			type: 'primary',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'primary',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Secondary TwoState Button</h3> `);

		TwoState($$renderer, {
			type: 'secondary',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'secondary',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Danger TwoState Button</h3> `);

		TwoState($$renderer, {
			type: 'danger',
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'danger',
			disabled: true,
			onclick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Icon TwoState Buttons</h3> <div class="demo-row">`);

		TwoState($$renderer, {
			icon: 'wxi-alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'primary',
			icon: 'wxi-alert',
			iconActive: 'wxi-check',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'secondary',
			icon: 'wxi-alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With Icon`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		TwoState($$renderer, { icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		TwoState($$renderer, { type: 'primary', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		TwoState($$renderer, { type: 'secondary', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		TwoState($$renderer, { type: 'danger', icon: 'wxi-alert' });
		$$renderer.push(`<!----> `);
		TwoState($$renderer, { disabled: true, icon: 'wxi-alert' });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Disabled</h3> <p>`);

		TwoState($$renderer, {
			type: 'primary',
			value: true,
			disabled: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary On`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'primary',
			disabled: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary Off`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <p>`);

		TwoState($$renderer, {
			title: 'disabled button',
			type: 'secondary',
			value: true,
			disabled: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Secondary On`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TwoState($$renderer, {
			type: 'secondary',
			disabled: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Secondary Off`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p></div>`);
	});
}