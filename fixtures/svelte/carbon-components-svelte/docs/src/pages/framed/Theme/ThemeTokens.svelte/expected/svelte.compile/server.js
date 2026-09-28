import * as $ from 'svelte/internal/server';

import {
	Button,
	Checkbox,
	InlineNotification,
	Link,
	Stack,
	Tag,
	TextInput,
	Theme,
	Tile,
	Toggle
} from "carbon-components-svelte";

export default function ThemeTokens($$renderer) {
	Theme($$renderer, {
		theme: 'g90',
		tokens: {
			// Interactive elements
			"interactive-01": "#d02670", // Primary button background
			"hover-primary": "#ee5396", // Primary button hover
			"active-primary": "#9f1853", // Primary button active
			"interactive-02": "#6f6f6f", // Secondary button background
			"hover-secondary": "#5e5e5e", // Secondary button hover
			// Links
			"link-01": "#ff6eb3", // Link text color

			// Tags
			"tag-background-blue": "#4a1942", // Tag background
			"tag-color-blue": "#ffb3d9", // Tag text color
			// Form elements
			"field-01": "#2d2d2d", // Input field background
			"ui-01": "#2d2d2d", // Tile background
			focus: "#ff6eb3", // Focus indicator color
			// Text colors
			"text-01": "#ffffff", // Primary text
			"text-02": "#c6c6c6", // Secondary text
			// Notification colors
			"support-04": "#a855f7" // Info notification color
		}
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);

			Link($$renderer, {
				href: '#example',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Themed link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);

			Tag($$renderer, {
				type: 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Themed tag`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			TextInput($$renderer, { labelText: 'Text input', placeholder: 'Enter text...' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { labelText: 'Checkbox with themed focus' });
			$$renderer.push(`<!----> `);
			Toggle($$renderer, { labelText: 'Toggle with themed colors' });
			$$renderer.push(`<!----> `);

			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p>Tile with themed background</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InlineNotification($$renderer, {
				kind: 'info',
				title: 'Info notification',
				subtitle: 'With themed colors',
				hideCloseButton: true,
				lowContrast: true
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}