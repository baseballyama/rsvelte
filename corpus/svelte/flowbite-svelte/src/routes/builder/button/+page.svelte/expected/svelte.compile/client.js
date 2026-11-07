import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	GradientButton,
	gradientButton,
	button,
	Radio,
	Label,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import H2 from "../utils/H2.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import { capitalizeFirstLetter } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="h-16"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];

	// MetaTag
	let breadcrumb_title = "Button builder";

	let description = "A quick way to create Button component";
	let title = "Button builder";
	let dir = "builder";

	// color, size, group, outline, shadow, disabled, pill
	const btnColors = Object.keys(button.variants.color);

	let btnColor = $.state("primary");
	let btnClass = $.state("");

	const changeBtnClass = () => {
		$.set(btnClass, $.get(btnClass) === "" ? "w-48" : "", true);
	};

	let btnLink = $.state("");

	const changeBtnLink = () => {
		$.set(btnLink, $.get(btnLink) === "" ? "/" : "", true);
	};

	let btnOutline = $.state(false);

	const changeBtnOutline = () => {
		$.set(btnOutline, !$.get(btnOutline));
	};

	let btnShadow = $.state(false);

	const changeBtnShadow = () => {
		$.set(btnShadow, !$.get(btnShadow));
	};

	let btnPill = $.state(false);

	const changeBtnPill = () => {
		$.set(btnPill, !$.get(btnPill));
	};

	let btnDisabled = $.state(false);

	const changeBtnDisabled = () => {
		$.set(btnDisabled, !$.get(btnDisabled));
	};

	const btnSizes = Object.keys(button.variants.size);
	let btnSize = $.state("md");
	const gradientColors = Object.keys(gradientButton.variants.color);
	let gradientColor = $.state("blue");
	const gradientSizes = Object.keys(button.variants.size);
	let gradientSize = $.state("md");
	let gradientClass = $.state("");

	const changeGradientClass = () => {
		$.set(gradientClass, $.get(gradientClass) === "" ? "w-48" : "", true);
	};

	let gradientOutline = $.state(false);

	const changeGradientOutline = () => {
		$.set(gradientOutline, !$.get(gradientOutline));
	};

	let gradientShadow = $.state(false);

	const changeGradientShadow = () => {
		$.set(gradientShadow, !$.get(gradientShadow));
	};

	let graidentPill = $.state(false);

	const changeGradientPill = () => {
		$.set(graidentPill, !$.get(graidentPill));
	};

	let gradientDisabled = $.state(false);

	const changeGradientDisabled = () => {
		$.set(gradientDisabled, !$.get(gradientDisabled));
	};

	let gradientLink = $.state("");

	const changeGradientLink = () => {
		$.set(gradientLink, $.get(gradientLink) === "" ? "/" : "", true);
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(btnColor) !== "primary") props.push(` color="${$.get(btnColor)}"`);
		if ($.get(btnShadow)) props.push(" shadow");
		if ($.get(btnOutline)) props.push(" outline");
		if ($.get(btnPill)) props.push(" pill");
		if ($.get(btnClass)) props.push(` class="${$.get(btnClass)}"`);
		if ($.get(btnLink)) props.push(` href="${$.get(btnLink)}"`);
		if ($.get(btnDisabled)) props.push(" disabled");
		if ($.get(btnSize) !== "md") props.push(` size="${$.get(btnSize)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Button${propsString}>My Button</Button>`;
	})());

	let gradientGeneratedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(gradientColor) !== "blue") props.push(` color="${$.get(gradientColor)}"`);
		if ($.get(gradientShadow)) props.push(" shadow");
		if ($.get(gradientOutline)) props.push(" outline");
		if ($.get(graidentPill)) props.push(" pill");
		if ($.get(gradientClass)) props.push(` class="${$.get(gradientClass)}"`);
		if ($.get(gradientLink)) props.push(` href="${$.get(gradientLink)}"`);
		if ($.get(gradientDisabled)) props.push(" disabled");
		if ($.get(gradientSize) !== "md") props.push(` size="${$.get(gradientSize)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<GradientButton${propsString}>My Gradient Button</GradientButton>`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	// gradient button
	let gradientBuilderExpand = $.state(false);

	let showGradientBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(gradientGeneratedCode)));

	const handleGradientBuilderExpandClick = () => {
		$.set(gradientBuilderExpand, !$.get(gradientBuilderExpand));
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

			var text = $.text('Button Builder');

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
			innerClass: 'flex flex-wrap gap-2',
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				{
					let $0 = $.derived(() => $.get(btnLink) ? $.get(btnLink) : "");

					Button(node_3, {
						get color() {
							return $.get(btnColor);
						},

						get class() {
							return $.get(btnClass);
						},

						get outline() {
							return $.get(btnOutline);
						},

						get shadow() {
							return $.get(btnShadow);
						},

						get pill() {
							return $.get(btnPill);
						},

						get disabled() {
							return $.get(btnDisabled);
						},

						get size() {
							return $.get(btnSize);
						},

						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Button');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_4 = $.child(div_1);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Color');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => btnColors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'btn_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(btnColor);
						},

						set group($$value) {
							$.set(btnColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(colorOption)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_6 = $.child(div_2);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Size');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => btnSizes, $.index, ($$anchor, sizeOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'btn_size',
						get value() {
							return $.get(sizeOption);
						},

						get group() {
							return $.get(btnSize);
						},

						set group($$value) {
							$.set(btnSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(sizeOption)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Button(node_8, {
					class: 'w-40',
					color: 'blue',
					onclick: changeBtnOutline,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(btnOutline) === false ? "Add outline" : "Remove outline"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-40',
					color: 'green',
					onclick: changeBtnShadow,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(btnShadow) === false ? "Add shadow" : "Remove shadow"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-40',
					color: 'yellow',
					onclick: changeBtnPill,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(btnPill) === false ? "Add pill" : "Remove pill"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'red',
					onclick: changeBtnDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(btnDisabled) === false ? "Add disabled" : "Remove disabled"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-40',
					onclick: changeBtnClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(btnClass) === "" ? "Add class" : "Remove class"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					class: 'w-40',
					color: 'sky',
					onclick: changeBtnLink,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(btnLink) === "" ? "Add link" : "Remove link"));
						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_14 = $.sibling(node_2, 2);

	H2(node_14, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Interactive Gradient Button Builder');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleGradientBuilderExpandClick,
				get expand() {
					return $.get(gradientBuilderExpand);
				},

				get showExpandButton() {
					return $.get(showGradientBuilderExpandButton);
				},

				get code() {
					return $.get(gradientGeneratedCode);
				}
			});
		};

		CodeWrapper(node_15, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_14 = root();
				var div_4 = $.first_child(fragment_14);
				var node_16 = $.child(div_4);

				GradientButton(node_16, {
					get outline() {
						return $.get(gradientOutline);
					},

					get shadow() {
						return $.get(gradientShadow);
					},

					get pill() {
						return $.get(graidentPill);
					},

					get class() {
						return $.get(gradientClass);
					},

					get disabled() {
						return $.get(gradientDisabled);
					},

					get color() {
						return $.get(gradientColor);
					},

					get size() {
						return $.get(gradientSize);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text();

						$.template_effect(($0) => $.set_text(text_13, $0), [() => capitalizeFirstLetter($.get(gradientColor))]);
						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_17 = $.child(div_5);

				Label(node_17, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('Color');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				$.each(node_18, 17, () => gradientColors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-32" },
						name: 'gradient_color',
						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(gradientColor);
						},

						set group($$value) {
							$.set(gradientColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text();

							$.template_effect(() => $.set_text(text_15, $.get(colorOption)));
							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_19 = $.child(div_6);

				Label(node_19, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('Size');

						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_19, 2);

				$.each(node_20, 17, () => gradientSizes, $.index, ($$anchor, sizeOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'gradient_size',
						get value() {
							return $.get(sizeOption);
						},

						get group() {
							return $.get(gradientSize);
						},

						set group($$value) {
							$.set(gradientSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text();

							$.template_effect(() => $.set_text(text_17, $.get(sizeOption)));
							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var node_21 = $.child(div_7);

				Button(node_21, {
					class: 'w-40',
					color: 'blue',
					onclick: changeGradientOutline,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_18 = $.text();

						$.template_effect(() => $.set_text(text_18, $.get(gradientOutline) === false ? "Add outline" : "Remove outline"));
						$.append($$anchor, text_18);
					},
					$$slots: { default: true }
				});

				var node_22 = $.sibling(node_21, 2);

				Button(node_22, {
					class: 'w-40',
					color: 'green',
					onclick: changeGradientShadow,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_19 = $.text();

						$.template_effect(() => $.set_text(text_19, $.get(gradientShadow) === false ? "Add shadow" : "Remove shadow"));
						$.append($$anchor, text_19);
					},
					$$slots: { default: true }
				});

				var node_23 = $.sibling(node_22, 2);

				Button(node_23, {
					class: 'w-40',
					color: 'yellow',
					onclick: changeGradientPill,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_20 = $.text();

						$.template_effect(() => $.set_text(text_20, $.get(graidentPill) === false ? "Add pill" : "Remove pill"));
						$.append($$anchor, text_20);
					},
					$$slots: { default: true }
				});

				var node_24 = $.sibling(node_23, 2);

				Button(node_24, {
					class: 'w-40',
					color: 'red',
					onclick: changeGradientDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_21 = $.text();

						$.template_effect(() => $.set_text(text_21, $.get(gradientDisabled) === false ? "Add disabled" : "Remove disabled"));
						$.append($$anchor, text_21);
					},
					$$slots: { default: true }
				});

				var node_25 = $.sibling(node_24, 2);

				Button(node_25, {
					class: 'w-40',
					onclick: changeGradientClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_22 = $.text();

						$.template_effect(() => $.set_text(text_22, $.get(gradientClass) === "" ? "Add class" : "Remove class"));
						$.append($$anchor, text_22);
					},
					$$slots: { default: true }
				});

				var node_26 = $.sibling(node_25, 2);

				Button(node_26, {
					class: 'w-40',
					color: 'sky',
					onclick: changeGradientLink,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_23 = $.text();

						$.template_effect(() => $.set_text(text_23, $.get(btnLink) === "" ? "Add link" : "Remove link"));
						$.append($$anchor, text_23);
					},
					$$slots: { default: true }
				});

				$.reset(div_7);
				$.append($$anchor, fragment_14);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}