import * as $ from 'svelte/internal/server';
import { Label, Input, Button, InputAddon, ButtonGroup, Checkbox } from "flowbite-svelte";

export default function Group($$renderer) {
	$$renderer.push(`<div>`);

	Label($$renderer, {
		class: 'mb-2',
		for: 'input-addon-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small additional text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->@`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'input-addon-sm',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		class: 'mb-2',
		for: 'input-addon-md',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default additional text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			Input($$renderer, {
				id: 'input-addon-md',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->.com`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		class: 'mb-2',
		for: 'input-addon-lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large additional text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->@`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'input-addon-lg',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->.com`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="pt-8">`);

	Label($$renderer, {
		for: 'input-addon-button',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Grouped with button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->@`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'input-addon-button',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Search`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'input-addon-crazy',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Crazy example`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					Checkbox($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Search`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->http://`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'input-addon-crazy',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->@`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					Checkbox($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Send`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->kg`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}