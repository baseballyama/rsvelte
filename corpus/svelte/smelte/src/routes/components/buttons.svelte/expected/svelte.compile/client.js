import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "components/Button";
import Icon from "components/Icon";
import Code from "docs/Code.svelte";
import PropsTable from "docs/PropsTable.svelte";
import buttons from "examples/buttons.txt";

var root = $.from_html(`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/buttons/"><p>Buttons allow users to take actions, and make choices, with a single tap.</p></blockquote> <h6 class="mb-3 mt-6">Basic</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Light</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Dark</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Block</h6> <div class="py-2"><!></div> <!> <h6 class="mb-3 mt-6">Outlined</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">As anchor</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Text</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Disabled</h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">FAB <a class="a" href="https://material.io/components/buttons-floating-action-button/">(Floating action button)</a></h6> <div class="py-2"><!></div> <h6 class="mb-3 mt-6">Fab flat</h6> <div class="py-2"><!></div> <!>`, 1);

export default function Buttons($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 4);
	var node = $.child(div);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_1 = $.child(div_1);

	Button(node_1, {
		light: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Button');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_2 = $.child(div_2);

	Button(node_2, {
		dark: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Button');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var node_3 = $.child(div_3);

	Button(node_3, {
		color: 'alert',
		dark: true,
		block: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Button');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	PropsTable(node_4, {
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

	var div_4 = $.sibling(node_4, 4);
	var node_5 = $.child(div_4);

	Button(node_5, {
		color: 'secondary',
		light: true,
		block: true,
		outlined: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Button');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 4);
	var node_6 = $.child(div_5);

	Button(node_6, {
		color: 'secondary',
		light: true,
		block: true,
		outlined: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Button');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 4);
	var node_7 = $.child(div_6);

	Button(node_7, {
		text: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Button');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 4);
	var node_8 = $.child(div_7);

	Button(node_8, {
		block: true,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Button');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 4);
	var node_9 = $.child(div_8);

	Button(node_9, { color: 'alert', icon: 'change_history' });
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 4);
	var node_10 = $.child(div_9);

	Button(node_10, {
		color: 'error',
		icon: 'change_history',
		text: true,
		light: true,
		flat: true
	});

	$.reset(div_9);

	var node_11 = $.sibling(div_9, 2);

	Code(node_11, {
		get code() {
			return buttons;
		}
	});

	$.append($$anchor, fragment);
}