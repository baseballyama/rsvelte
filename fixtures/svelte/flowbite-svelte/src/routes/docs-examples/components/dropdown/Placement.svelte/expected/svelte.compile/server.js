import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";

import {
	ChevronDownOutline,
	ChevronUpOutline,
	ChevronRightOutline,
	ChevronLeftOutline
} from "flowbite-svelte-icons";

export default function Placement($$renderer) {
	Dropdown($$renderer, {
		simple: true,
		placement: 'top',
		triggeredBy: '#top-dd',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Earnings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		placement: 'bottom',
		triggeredBy: '#bottom-dd',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Earnings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		placement: 'right',
		triggeredBy: '#right-dd',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Earnings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		placement: 'left',
		triggeredBy: '#left-dd',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Earnings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div id="placements" class="my-8 flex h-96 flex-col items-center justify-center gap-2">`);

	Button($$renderer, {
		id: 'top-dd',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown top`);
			ChevronUpOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex space-x-2 rtl:space-x-reverse">`);

	Button($$renderer, {
		id: 'left-dd',
		children: ($$renderer) => {
			ChevronLeftOutline($$renderer, { class: 'me-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->Dropdown left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'right-dd',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown right`);
			ChevronRightOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		id: 'bottom-dd',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown bottom`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}