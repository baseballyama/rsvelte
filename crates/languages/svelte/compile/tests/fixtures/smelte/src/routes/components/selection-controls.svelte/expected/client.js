import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "components/Checkbox";
import { RadioButtonGroup } from "components/RadioButton";
import Switch from "components/Switch";
import Icon from "components/Icon";
import Code from "docs/Code.svelte";
import code from "examples/checkboxes.txt";
import PropsTable from "docs/PropsTable.svelte";

var root = $.from_html(`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/selection-controls/"><p>Selection controls allow the user to select options.</p></blockquote> <h5 class="pb-8 pt-10" id="checkboxes">Checkboxes</h5> <!> <!> <!> <!> <h5 class="pb-8 pt-10" id="radio-buttons">Radio buttons</h5> <!> <!> <!> <!> <h5 class="pb-8 pt-10" id="switches">Switches</h5> <!> <!> <!> <!>`, 1);

export default function Selection_controls($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Checkbox(node, { label: 'A checkbox' });

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, { color: 'secondary', label: 'A colored checkbox' });

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, { disabled: true, label: 'A disabled checkbox' });

	var node_3 = $.sibling(node_2, 2);

	PropsTable(node_3, {
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
				prop: "checked",
				description: "Checked state",
				default: false,
				type: "Boolean"
			},

			{
				prop: "disabled",
				description: "Disabled state",
				default: false,
				type: "Boolean"
			},

			{
				prop: "classes",
				description: "Classes to pass down to checkbox wrapper",
				default: "inline-flex items-center mb-2 cursor-pointer z-10",
				type: "String"
			}
		]
	});

	var node_4 = $.sibling(node_3, 4);

	RadioButtonGroup(node_4, {
		name: 'test',
		items: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
	});

	var node_5 = $.sibling(node_4, 2);

	RadioButtonGroup(node_5, {
		name: 'Colored test',
		color: 'blue',
		items: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
	});

	var node_6 = $.sibling(node_5, 2);

	RadioButtonGroup(node_6, {
		name: 'test-disabled',
		disabled: true,
		items: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
	});

	var node_7 = $.sibling(node_6, 2);

	PropsTable(node_7, {
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
				prop: "selected",
				description: "Selected state",
				default: false,
				type: "Boolean"
			},

			{
				prop: "disabled",
				description: "Disabled state",
				default: false,
				type: "Boolean"
			},

			{
				prop: "classes",
				description: "Classes to pass down to radio button wrapper",
				default: "inline-flex block items-center mb-2 cursor-pointer z-0",
				type: "String"
			}
		]
	});

	var node_8 = $.sibling(node_7, 4);

	Switch(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	Switch(node_9, { color: 'error' });

	var node_10 = $.sibling(node_9, 2);

	PropsTable(node_10, {
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
				prop: "disabled",
				description: "Disabled state",
				default: false,
				type: "Boolean"
			},

			{
				prop: "classes",
				description: "Classes to pass down to checkbox wrapper",
				default: "inline-flex block items-center mb-2 cursor-pointer z-0",
				type: "String"
			},

			{
				prop: "trackClasses",
				description: "Track classes",
				default: "relative w-10 h-auto z-0 rounded-full overflow-visible flex items-center justify-center",
				type: "String"
			},

			{
				prop: "thumbClasses",
				description: "Thumb classes",
				default: "rounded-full p-2 w-5 h-5 absolute shadow duration-100",
				type: "String"
			},

			{
				prop: "labelClasses",
				description: "Tabel classes",
				default: "pl-2 cursor-pointer",
				type: "String"
			}
		]
	});

	var node_11 = $.sibling(node_10, 2);

	Code(node_11, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
}