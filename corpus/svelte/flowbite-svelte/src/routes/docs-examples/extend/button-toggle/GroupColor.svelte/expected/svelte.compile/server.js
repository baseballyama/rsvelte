import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function GroupColor($$renderer) {
	let singleValue = null;

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			singleValue = value;
			console.log("Single selection:", value);
		}
	}

	ButtonToggleGroup($$renderer, {
		color: 'secondary',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'gray',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'red',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'orange',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'amber',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'yellow',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'lime',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'green',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'emerald',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'teal',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'cyan',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'sky',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'blue',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'indigo',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'violet',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'purple',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'fuchsia',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'pink',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		color: 'rose',
		onSelect: handleSingleSelect,
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

	$$renderer.push(`<!---->`);
}