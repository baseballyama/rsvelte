import * as $ from 'svelte/internal/server';
import Button from "components/Button";
import Icon from "components/Icon";
import Code from "docs/Code.svelte";
import PropsTable from "docs/PropsTable.svelte";
import buttons from "examples/buttons.txt";

export default function Buttons($$renderer) {
	$$renderer.push(`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/buttons/"><p>Buttons allow users to take actions, and make choices, with a single tap.</p></blockquote> <h6 class="mb-3 mt-6">Basic</h6> <div class="py-2">`);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Light</h6> <div class="py-2">`);

	Button($$renderer, {
		light: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Dark</h6> <div class="py-2">`);

	Button($$renderer, {
		dark: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Block</h6> <div class="py-2">`);

	Button($$renderer, {
		color: 'alert',
		dark: true,
		block: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	PropsTable($$renderer, {
		data: [
			{
				prop: "value",
				description: "Bound boolean value",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "color",
				description: "Color variant, accepts any of the main colors described in Tailwind config",
				type: "String",
				default: "primary"
			},

			{
				prop: "outlined",
				description: "Outlined variant",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "text",
				description: "Text button variant (transparent background)",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "block",
				description: "Full block width button",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "disabled",
				description: "Disabled state",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "icon",
				description: "Icon button variant",
				type: "String",
				default: "null"
			},

			{
				prop: "small",
				description: "Smaller size",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "light",
				description: "Lighter variant",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "dark",
				description: "Darker variant",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "flat",
				description: "Flat variant",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "iconClass",
				description: "List of classes to pass down to icon",
				type: "String",
				default: "empty string"
			},

			{
				prop: "href",
				description: "Link URL",
				type: "String",
				default: "null"
			},

			{
				prop: "add",
				description: "List of classes to add to the component",
				type: "String",
				default: "empty string"
			},

			{
				prop: "remove",
				description: "List of classes to remove from the component",
				type: "String",
				default: "empty string"
			},

			{
				prop: "replace",
				description: "List of classes to replace in the component",
				type: "Object",
				default: "{}"
			}
		]
	});

	$$renderer.push(`<!----> <h6 class="mb-3 mt-6">Outlined</h6> <div class="py-2">`);

	Button($$renderer, {
		color: 'secondary',
		light: true,
		block: true,
		outlined: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">As anchor</h6> <div class="py-2">`);

	Button($$renderer, {
		color: 'secondary',
		light: true,
		block: true,
		outlined: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Text</h6> <div class="py-2">`);

	Button($$renderer, {
		text: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Disabled</h6> <div class="py-2">`);

	Button($$renderer, {
		block: true,
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">FAB <a class="a" href="https://material.io/components/buttons-floating-action-button/">(Floating action button)</a></h6> <div class="py-2">`);
	Button($$renderer, { color: 'alert', icon: 'change_history' });
	$$renderer.push(`<!----></div> <h6 class="mb-3 mt-6">Fab flat</h6> <div class="py-2">`);

	Button($$renderer, {
		color: 'error',
		icon: 'change_history',
		text: true,
		light: true,
		flat: true
	});

	$$renderer.push(`<!----></div> `);
	Code($$renderer, { code: buttons });
	$$renderer.push(`<!---->`);
}