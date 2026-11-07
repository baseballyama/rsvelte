import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function RoundedSize($$renderer) {
	let singleValue = null;

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			singleValue = value;
			console.log("Single selection:", value);
		}
	}

	$$renderer.push(`<div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: sm</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		roundedSize: 'sm',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: md</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		roundedSize: 'md',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: lg</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		roundedSize: 'lg',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: xl</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		roundedSize: 'xl',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: full</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		roundedSize: 'full',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}