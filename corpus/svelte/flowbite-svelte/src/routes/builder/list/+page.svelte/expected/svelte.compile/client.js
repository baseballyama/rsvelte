import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, list, Li, Heading, Label, Radio, Button, uiHelpers } from "$lib";
import { CheckCircleSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!>At least 10 characters (and up to 100 characters) <!>`, 1);
var root_2 = $.from_html(`<!>At least one lowercase character`, 1);
var root_3 = $.from_html(`<!>Inclusion of at least one special character, e.g., ! @ # ?`, 1);
var root_4 = $.from_html(`<!> <!> <div class="mt-4 mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "List builder";

	let description = "A quick way to create List component";
	let title = "List builder";
	let dir = "builder";
	const tags = Object.keys(list.variants.tag);
	let listTag = $.state("ul");
	const positions = Object.keys(list.variants.position);
	let listPosition = $.state("inside");
	let listIcon = $.state(false);

	const changeListIcon = () => {
		$.set(listIcon, !$.get(listIcon));

		if ($.get(listIcon)) {
			$.set(nested, false);
		}
	};

	let ctxClass = $.state("");

	const changeCtxClass = () => {
		$.set(ctxClass, $.get(ctxClass) === "" ? "pl-8" : "", true);
	};

	let nested = $.state(false);

	const changeNested = () => {
		$.set(nested, !$.get(nested));

		if ($.get(nested)) {
			$.set(listIcon, false);
		}
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];
		let iconSlot;
		let liIcon;
		let nestedContent;

		if ($.get(listTag) !== "ul") props.push(` tag="${$.get(listTag)}"`);
		if ($.get(listPosition) !== "inside") props.push(` position="${$.get(listPosition)}"`);

		// if (linkClass) props.push(` class="${linkClass}"`);
		iconSlot = $.get(listIcon)
			? `<CheckCircleSolid class="me-2 h-5 w-5 text-green-500 dark:text-green-400" />`
			: "";

		if ($.get(ctxClass)) props.push(` ctxClass="${$.get(ctxClass)}"`);

		liIcon = $.get(listIcon) ? ` icon` : "";

		nestedContent = $.get(nested)
			? `<List tag="ol" ctxClass="mt-2 space-y-1 ps-5">
      <Li>item 1-1</Li>
      <Li>item 1-2</Li>
      <Li>item 1-3</Li>
    </List>
      `
			: "";

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<List${propsString}>
  <Li${liIcon}>${iconSlot}Item 1${nestedContent}</Li>
  <Li${liIcon}>${iconSlot}Item 2</Li>
  <Li${liIcon}>${iconSlot}Item 3</Li>
</List>`;
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

	var fragment = root();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('List Builder');

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
				var fragment_2 = root_4();
				var node_3 = $.first_child(fragment_2);

				Heading(node_3, {
					tag: 'h2',
					class: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('List title');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				List(node_4, {
					get tag() {
						return $.get(listTag);
					},

					get position() {
						return $.get(listPosition);
					},
					class: 'space-y-1 text-gray-500 dark:text-gray-400',
					get ctxClass() {
						return $.get(ctxClass);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_5 = $.first_child(fragment_3);

						Li(node_5, {
							get icon() {
								return $.get(listIcon);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_6 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										CheckCircleSolid($$anchor, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
									};

									$.if(node_6, ($$render) => {
										if ($.get(listIcon)) $$render(consequent);
									});
								}

								var node_7 = $.sibling(node_6, 2);

								{
									var consequent_1 = ($$anchor) => {
										List($$anchor, {
											tag: 'ol',
											ctxClass: 'mt-2 space-y-1 ps-5',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_8 = $.first_child(fragment_7);

												Li(node_8, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('item 1-1');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												var node_9 = $.sibling(node_8, 2);

												Li(node_9, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('item 1-2');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												var node_10 = $.sibling(node_9, 2);

												Li(node_10, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('item 1-3');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_7, ($$render) => {
										if ($.get(nested)) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_11 = $.sibling(node_5, 2);

						Li(node_11, {
							get icon() {
								return $.get(listIcon);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_2();
								var node_12 = $.first_child(fragment_8);

								{
									var consequent_2 = ($$anchor) => {
										CheckCircleSolid($$anchor, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
									};

									$.if(node_12, ($$render) => {
										if ($.get(listIcon)) $$render(consequent_2);
									});
								}

								$.next();
								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_11, 2);

						Li(node_13, {
							get icon() {
								return $.get(listIcon);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_3();
								var node_14 = $.first_child(fragment_10);

								{
									var consequent_3 = ($$anchor) => {
										CheckCircleSolid($$anchor, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
									};

									$.if(node_14, ($$render) => {
										if ($.get(listIcon)) $$render(consequent_3);
									});
								}

								$.next();
								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var div = $.sibling(node_4, 2);
				var node_15 = $.child(div);

				Label(node_15, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Tag');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				$.each(node_16, 17, () => tags, $.index, ($$anchor, tag) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'list_tag',
						get value() {
							return $.get(tag);
						},

						get group() {
							return $.get(listTag);
						},

						set group($$value) {
							$.set(listTag, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(tag)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_17 = $.child(div_1);

				Label(node_17, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Position');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				$.each(node_18, 17, () => positions, $.index, ($$anchor, position) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'list_position',
						get value() {
							return $.get(position);
						},

						get group() {
							return $.get(listPosition);
						},

						set group($$value) {
							$.set(listPosition, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(position)));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_19 = $.child(div_2);

				Button(node_19, {
					class: 'w-48',
					color: 'blue',
					onclick: changeListIcon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(listIcon) ? "Remove icon" : "Add icon"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_19, 2);

				Button(node_20, {
					class: 'w-48',
					color: 'rose',
					onclick: changeCtxClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(ctxClass) !== "" ? "Remove ctxClass" : "Add ctxClass"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_21 = $.sibling(node_20, 2);

				Button(node_21, {
					class: 'w-48',
					color: 'teal',
					onclick: changeNested,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(nested) ? "Remove nested" : "Add nested"));
						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}