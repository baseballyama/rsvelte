import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isSvelteOverflow, getExampleFileName } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";
import * as ExampleComponents from "../layoutExamples/index";

var root = $.from_html(`<div class="mb-8 flex flex-wrap"><!> <!></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Layout builder";

	let description = "A quick way to create Layout component";
	let title = "Layout builder";
	let dir = "builder";

	// for Props table
	// import CompoAttributesViewer from '../utils/CompoAttributesViewer.svelte';
	// for examples section that dynamically changes the svelte component and svelteCode content
	const exampleModules = import.meta.glob("../layoutExamples/*.svelte", { query: "?raw", import: "default", eager: true });

	const exampleArr = [
		{ name: "One column", component: ExampleComponents.OneColumn },
		{
			name: "Two columns even",
			component: ExampleComponents.TwoColumnsEven
		},

		{
			name: "Two columns uneven",
			component: ExampleComponents.TwoColumnsUneven
		},

		{
			name: "Three columns even",
			component: ExampleComponents.ThreeColumnsEven
		}
	];

	let selectedExample = $.state($.proxy(exampleArr[0].name));
	let svelteCode = $.derived(() => getExampleFileName($.get(selectedExample), exampleArr));

	function findObject(arr, name) {
		const matchingObject = arr.find((obj) => obj.name === name);

		return matchingObject ? matchingObject.component : null;
	}

	const SelectedComponent = $.derived(() => findObject(exampleArr, $.get(selectedExample)));

	// end of dynamic svelte component
	// for DynamicCodeBlock setup for examples section. dynamically adjust the height of the code block based on the svelteCode content.
	let codeBlock = uiHelpers();

	let expand = $.state(false);
	let showExpandButton = $.derived(() => isSvelteOverflow($.get(svelteCode), exampleModules));

	const handleExpandClick = () => {
		$.set(expand, !$.get(expand));
	};

	$.user_effect(() => {
		$.set(expand, codeBlock.isOpen, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	// end of DynamicCodeBlock setup
	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Layout');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				replaceLib: true,
				handleExpandClick,
				get expand() {
					return $.get(expand);
				},

				get showExpandButton() {
					return $.get(showExpandButton);
				},

				get code() {
					return exampleModules[`../layoutExamples/${$.get(svelteCode)}`];
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Label(node_3, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Example');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				$.each(node_4, 17, () => exampleArr, $.index, ($$anchor, style) => {
					Radio($$anchor, {
						class: 'my-1 w-[170px]',
						onclick: () => $.set(expand, false),
						name: 'block_style',
						get value() {
							return $.get(style).name;
						},

						get group() {
							return $.get(selectedExample);
						},

						set group($$value) {
							$.set(selectedExample, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(style).name));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_5 = $.sibling(div, 2);

				$.component(node_5, () => $.get(SelectedComponent), ($$anchor, SelectedComponent_1) => {
					SelectedComponent_1($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}