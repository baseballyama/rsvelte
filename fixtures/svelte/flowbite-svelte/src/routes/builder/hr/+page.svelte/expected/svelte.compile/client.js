import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Hr, P, Label, Radio, uiHelpers } from "$lib";
import { QuoteSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="mb-4 sm:h-[250px] md:h-[200px]"><!> <!> <!></div> <div class="flex flex-wrap space-x-2"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Hr builder";

	let description = "A quick way to create Hr component";
	let title = "Hr builder";
	let dir = "builder";
	const types = ["default", "trimmed", "icon", "text", "shape"];
	let selectedStyle = $.state("default");

	// code generator
	let generatedCode = $.derived(() => (() => {
		let hr;

		if ($.get(selectedStyle) === "default") {
			hr = `<Hr hrClass="my-8" />`;
		}

		if ($.get(selectedStyle) === "trimmed") {
			hr = `<Hr hrClass="w-48 h-1 mx-auto my-4 rounded md:my-10" />`;
		}

		if ($.get(selectedStyle) === "icon") {
			hr = `<Hr hrClass="my-8 w-64 h-1" icon>
  <QuoteSolid class="w-4 h-4 text-gray-700 dark:text-gray-300" />
</Hr>`;
		}

		if ($.get(selectedStyle) === "text") {
			hr = `<Hr hrClass="my-8 w-64">or</Hr>`;
		}

		if ($.get(selectedStyle) === "shape") {
			hr = `<Hr hrClass="my-8 mx-auto w-8 h-8" />`;
		}

		return `<p>Lorem ipsum dolor sit amet.</p> 
   ${hr} 
<p>Fusce eu vitae pretium libero imperdiet.</p>`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hr Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				P(node_3, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools.');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						Hr($$anchor, { class: 'mx-auto my-4 h-1 w-48 rounded md:my-10' });
					};

					var consequent_1 = ($$anchor) => {
						Hr($$anchor, {
							class: 'my-8 h-1 w-64',
							children: ($$anchor, $$slotProps) => {
								QuoteSolid($$anchor, { class: 'h-6 w-6 text-gray-700 dark:text-gray-300' });
							},
							$$slots: { default: true }
						});
					};

					var consequent_2 = ($$anchor) => {
						Hr($$anchor, {
							class: 'my-8 w-64',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('or');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					};

					var consequent_3 = ($$anchor) => {
						Hr($$anchor, { class: 'mx-auto my-8 h-8 w-8' });
					};

					var alternate = ($$anchor) => {
						Hr($$anchor, { class: 'my-8' });
					};

					$.if(node_4, ($$render) => {
						if ($.get(selectedStyle) === "trimmed") $$render(consequent); else if ($.get(selectedStyle) === "icon") $$render(consequent_1, 1); else if ($.get(selectedStyle) === "text") $$render(consequent_2, 2); else if ($.get(selectedStyle) === "shape") $$render(consequent_3, 3); else $$render(alternate, -1);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				P(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Color');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => types, $.index, ($$anchor, type) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'hr_style',
						get value() {
							return $.get(type);
						},

						get group() {
							return $.get(selectedStyle);
						},

						set group($$value) {
							$.set(selectedStyle, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(type)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}