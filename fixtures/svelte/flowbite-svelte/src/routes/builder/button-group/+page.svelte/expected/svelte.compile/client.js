import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ButtonGroup,
	buttonGroup,
	Button,
	button,
	Label,
	Radio,
	uiHelpers
} from "$lib";

import { UserCircleSolid, AdjustmentsVerticalSolid, DownloadSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!>Profile`, 1);
var root_1 = $.from_html(`<!>Settings`, 1);
var root_2 = $.from_html(`<!>Messages`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex h-16 items-center justify-center"><!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Button group builder";

	let description = "A quick way to create Button group component";
	let title = "Button group builder";
	let dir = "builder";

	// size, class
	const sizes = Object.keys(buttonGroup.variants.size);

	let size = $.state("md");

	// button colors
	const colors = Object.keys(button.variants.color);

	let color = $.state("primary");
	let link = $.state("");

	const changeLink = () => {
		$.set(link, $.get(link) === "" ? "/" : "", true);
	};

	let icon = $.state(false);

	const changeIcon = () => {
		$.set(icon, !$.get(icon));
	};

	let outline = $.state(false);

	const changeOutline = () => {
		$.set(outline, !$.get(outline));
	};

	let buttonGroupClass = $.state("");

	const changeClass = () => {
		$.set(buttonGroupClass, $.get(buttonGroupClass) === "" ? "ml-4" : "", true);
	};

	let generatedCode = $.derived(() => (() => {
		let props = [];
		let btnProps = [];
		let icon1 = $.get(icon) ? '<UserCircleSolid class="me-2 h-4 w-4" />' : "";

		let icon2 = $.get(icon)
			? '<AdjustmentsVerticalSolid class="me-2 h-4 w-4" />'
			: "";

		let icon3 = $.get(icon) ? '<DownloadSolid class="me-2 h-4 w-4" />' : "";

		if ($.get(size) !== "md") props.push(` size="${$.get(size)}"`);
		if ($.get(buttonGroupClass) !== "") props.push(` class="${$.get(buttonGroupClass)}"`);
		if ($.get(link)) btnProps.push(` href="${$.get(link)}"`);
		if ($.get(color) !== "primary") btnProps.push(` color="${$.get(color)}"`);
		if ($.get(outline)) btnProps.push(" outline");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<ButtonGroup${propsString}>
  <Button${btnProps}>${icon1}Profile</Button>
  <Button${btnProps}>${icon2}Settings</Button>
  <Button${btnProps}>${icon3}Messages</Button>
</ButtonGroup>`;
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

	var fragment = root_3();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button-group Builder');

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
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				ButtonGroup(node_3, {
					get size() {
						return $.get(size);
					},

					get class() {
						return $.get(buttonGroupClass);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_3();
						var node_4 = $.first_child(fragment_3);

						Button(node_4, {
							get color() {
								return $.get(color);
							},

							get href() {
								return $.get(link);
							},

							get outline() {
								return $.get(outline);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										UserCircleSolid($$anchor, { class: 'me-2 h-4 w-4' });
									};

									$.if(node_5, ($$render) => {
										if ($.get(icon)) $$render(consequent);
									});
								}

								$.next();
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_4, 2);

						Button(node_6, {
							get color() {
								return $.get(color);
							},

							get href() {
								return $.get(link);
							},

							get outline() {
								return $.get(outline);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_7 = $.first_child(fragment_6);

								{
									var consequent_1 = ($$anchor) => {
										AdjustmentsVerticalSolid($$anchor, { class: 'me-2 h-4 w-4' });
									};

									$.if(node_7, ($$render) => {
										if ($.get(icon)) $$render(consequent_1);
									});
								}

								$.next();
								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_6, 2);

						Button(node_8, {
							get color() {
								return $.get(color);
							},

							get href() {
								return $.get(link);
							},

							get outline() {
								return $.get(outline);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_2();
								var node_9 = $.first_child(fragment_8);

								{
									var consequent_2 = ($$anchor) => {
										DownloadSolid($$anchor, { class: 'me-2 h-4 w-4' });
									};

									$.if(node_9, ($$render) => {
										if ($.get(icon)) $$render(consequent_2);
									});
								}

								$.next();
								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_10 = $.child(div_1);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Size');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => sizes, $.index, ($$anchor, sizeOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'size',
						get value() {
							return $.get(sizeOption);
						},

						get group() {
							return $.get(size);
						},

						set group($$value) {
							$.set(size, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(sizeOption)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_12 = $.child(div_2);

				Label(node_12, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				$.each(node_13, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(color);
						},

						set group($$value) {
							$.set(color, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(colorOption)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_14 = $.child(div_3);

				Button(node_14, {
					class: 'w-40',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(buttonGroupClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				Button(node_15, {
					class: 'w-40',
					color: 'secondary',
					onclick: changeLink,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(link) === "" ? "Add link" : "Remove link"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				Button(node_16, {
					class: 'w-40',
					color: 'red',
					onclick: changeIcon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(icon) ? "Remove icon" : "Add icon"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				Button(node_17, {
					class: 'w-40',
					color: 'violet',
					onclick: changeOutline,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(outline) ? "Remove outline" : "Add outline"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}