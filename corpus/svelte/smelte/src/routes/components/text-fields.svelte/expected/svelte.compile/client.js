import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextField, { Label } from "components/TextField";
import DataTable from "components/DataTable";
import Code from "docs/Code.svelte";
import PropsTable from "docs/PropsTable.svelte";
import textFields from "examples/text-fields.txt";

var root = $.from_html(
	`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/text-fields/#"><p>Text fields let users enter and edit text.</p></blockquote> <h6 class="mb-3 mt-6">Basic</h6> <!> <h6>Props</h6> <p class="mb-5 mt-3">Inputs accept any props that a normal input element can take,
like <span class="code-inline">max-length</span> or <span class="code-inline">type</span>.</p> <!> <h6 class="mb-3 mt-6">With hint</h6> <!> <h6 class="mb-3 mt-6">With hint (dense)</h6> <!> <h6 class="mb-3 mt-6">With error</h6> <!> <h6 class="mb-3 mt-6">Outlined</h6> <!> <h6 class="mb-3 mt-6">Outlined with hint</h6> <!> <h6 class="mb-3 mt-6">Outlined with error</h6> <!> <h6 class="mb-3 mt-6">Outlined textarea</h6> <!> <h6 class="mb-3 mt-6">With basic validation (type="number" min="10" max="100")</h6> <!> <h6 class="mb-3 mt-6">With icon</h6> <!> <!> <h6 class="mb-3 mt-6">Disabled</h6> <!> <!> <!>`,
	1
);

export default function Text_fields($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	TextField(node, { label: 'Test label' });

	var node_1 = $.sibling(node, 6);

	PropsTable(node_1, {
		data: [
			{
				prop: "value",
				description: "Input value",
				type: "Boolean",
				default: "null"
			},

			{
				prop: "color",
				description: "Color variant, accepts any of the main colors described in Tailwind config",
				type: "String",
				default: "primary"
			},

			{
				prop: "label",
				description: "Input label",
				type: "String",
				default: "Empty&nbsp;string"
			},

			{
				prop: "placeholder",
				description: "Input placeholder",
				type: "String",
				default: "Empty&nbsp;string"
			},

			{
				prop: "outlined",
				description: "Outlined variant",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "hint",
				description: "Hint text appearing under the input",
				type: "String",
				default: "Empty&nbsp;string"
			},

			{
				prop: "error",
				description: "Error text under the input",
				type: "String | Boolean",
				default: "false"
			},

			{
				prop: "append",
				description: "Append icon name",
				type: "String",
				default: "Empty&nbsp;string"
			},

			{
				prop: "prepend",
				description: "Prepend icon name",
				type: "String",
				default: "Empty&nbsp;string"
			},

			{
				prop: "persistentHint",
				description: "Always show hint, not only on focus",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "textarea",
				description: "Whether text field is textarea",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "rows",
				description: "Rows count for textarea",
				type: "Integer",
				default: 5
			},

			{
				prop: "select",
				description: "Whether text field is select",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "autocomplete",
				description: "Whether select field is autocomplete",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "noUnderline",
				description: "Hide focus underline element",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "appendReverse",
				description: "Reverse appended icon",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "prependReverse",
				description: "Reverse prepended icon",
				type: "Boolean",
				default: "false"
			},

			{
				prop: "bgColor",
				description: "Background color to match for outlined elevated label",
				type: "String",
				default: "white"
			},

			{
				prop: "iconClasses",
				description: "Classes to pass down to icon component",
				type: "String",
				default: "Empty&nbsp;string"
			}
		]
	});

	var node_2 = $.sibling(node_1, 4);

	TextField(node_2, {
		label: 'Test label',
		hint: 'Test hint',
		persistentHint: true,
		color: 'blue'
	});

	var node_3 = $.sibling(node_2, 4);

	TextField(node_3, {
		label: 'Test label',
		hint: 'Test hint',
		persistentHint: true,
		color: 'blue',
		dense: true
	});

	var node_4 = $.sibling(node_3, 4);

	TextField(node_4, { label: 'Test label', error: 'Test error' });

	var node_5 = $.sibling(node_4, 4);

	TextField(node_5, { label: 'Test label', outlined: true });

	var node_6 = $.sibling(node_5, 4);

	TextField(node_6, { label: 'Test label', outlined: true, hint: 'Test hint' });

	var node_7 = $.sibling(node_6, 4);

	TextField(node_7, { label: 'Test label', outlined: true, error: 'Test error' });

	var node_8 = $.sibling(node_7, 4);

	TextField(node_8, {
		label: 'Test label',
		textarea: true,
		rows: '5',
		outlined: true
	});

	var node_9 = $.sibling(node_8, 4);

	TextField(node_9, {
		label: 'Test label',
		outlined: true,
		type: 'number',
		min: '10',
		max: '100'
	});

	var node_10 = $.sibling(node_9, 4);

	TextField(node_10, { prepend: 'search', label: 'Icon before' });

	var node_11 = $.sibling(node_10, 2);

	TextField(node_11, { append: 'search', label: 'Icon after' });

	var node_12 = $.sibling(node_11, 4);

	TextField(node_12, { disabled: true, prepend: 'search', label: 'Icon before' });

	var node_13 = $.sibling(node_12, 2);

	TextField(node_13, { disabled: true, append: 'search', label: 'Icon after' });

	var node_14 = $.sibling(node_13, 2);

	Code(node_14, {
		get code() {
			return textFields;
		}
	});

	$.append($$anchor, fragment);
}