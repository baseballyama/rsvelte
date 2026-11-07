import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<p>Tile with themed background</p>`);
var root_1 = $.from_html(`<div><!> <!></div> <div><!></div> <div><!></div> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ThemeTokens($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Theme(node, {
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

	var node_1 = $.sibling(node, 2);

	Stack(node_1, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			Button(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Primary button');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				kind: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Secondary button');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_4 = $.child(div_1);

			Link(node_4, {
				href: '#example',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Themed link');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_5 = $.child(div_2);

			Tag(node_5, {
				type: 'blue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Themed tag');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var node_6 = $.sibling(div_2, 2);

			TextInput(node_6, { labelText: 'Text input', placeholder: 'Enter text...' });

			var node_7 = $.sibling(node_6, 2);

			Checkbox(node_7, { labelText: 'Checkbox with themed focus' });

			var node_8 = $.sibling(node_7, 2);

			Toggle(node_8, { labelText: 'Toggle with themed colors' });

			var node_9 = $.sibling(node_8, 2);

			Tile(node_9, {
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			InlineNotification(node_10, {
				kind: 'info',
				title: 'Info notification',
				subtitle: 'With themed colors',
				hideCloseButton: true,
				lowContrast: true
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}