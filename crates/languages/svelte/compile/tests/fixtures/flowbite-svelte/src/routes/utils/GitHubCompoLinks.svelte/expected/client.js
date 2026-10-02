import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { getFilteredFileNames } from "./helpers";
import { github } from "./consts";

var root = $.from_html(`<li><a target="_blank"> </a></li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function GitHubCompoLinks($$anchor, $$props) {
	$.push($$props, true);

	const pathname = page.url.pathname;
	const parts = pathname.split("/").filter(Boolean);
	const dirName = parts.at(-1); // "input-field"

	const forms = [
		"Checkbox",
		"Dropzone",
		"Fileupload",
		"FloatingLabelInput",
		"Helper",
		"Input",
		"InputAddon",
		"Label",
		"MultiSelect",
		"NumberInput",
		"PhoneInput",
		"Radio",
		"Range",
		"Search",
		"Select",
		"Tags",
		"Textarea",
		"Timepicker",
		"Toggle"
	];

	const typography = [
		"A",
		"Blockquote",
		"DesriptionList",
		"Heading",
		"Hr",
		"Img",
		"Layout",
		"Li",
		"DescriptionList",
		"List",
		"Mark",
		"P",
		"Secondary",
		"Span"
	];

	// Special cases for components that don't follow the standard directory pattern
	const specialCases = {
		Input: "forms/input-field",
		InputAddon: "forms/input-addon",
		MultiSelect: "forms/select",
		ButtonToggle: "forms/button-toggle",
		ButtonToggleGroup: "forms/button-toggle",
		RadioButton: "forms/radio",
		Progressradial: "progress",
		Toolbar: "toolbar",
		ToolbarButton: "toolbar",
		CloseButton: "utils",
		P: "typography/paragraph",
		Li: "typography/list"
	};

	// default for docs/components
	let fileNames = $.state($.proxy(getFilteredFileNames(dirName || "")));

	// if components are given in docs/forms, typography etc use it
	$.user_effect(() => {
		if ($$props.components) {
			// Split the components into an array
			const componentArray = $$props.components.split(", ");

			$.set(fileNames, componentArray, true);
		}
	});

	function getComponentPath(compo) {
		// Check for special cases first
		if (specialCases[compo]) {
			return `${specialCases[compo]}/${compo}.svelte`;
		}

		// Default behavior
		if (forms.includes(compo)) {
			return `forms/${compo.toLowerCase()}/${compo}.svelte`;
		} else if (typography.includes(compo)) {
			return `typography/${compo.toLowerCase()}/${compo}.svelte`;
		} else {
			return `${dirName}/${compo}.svelte`;
		}
	}

	var ul = root_1();

	$.each(ul, 21, () => $.get(fileNames), $.index, ($$anchor, compo) => {
		var li = root();
		var a = $.child(li);
		var text = $.only_child(a);

		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', `${github ?? ''}/${$0 ?? ''}`);
				$.set_text(text, `${$.get(compo) ?? ''} component on GitHub`);
			},
			[() => getComponentPath($.get(compo))]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}