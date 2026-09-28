import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar, progressbar, Button, Label, Radio, uiHelpers } from "$lib";
import { sineOut } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="my-8 h-16"><!></div> <div class="mb-8 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-8 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Progress builder";

	let description = "A quick way to create Progress component";
	let title = "Progress builder";
	let dir = "builder";
	let progress = $.state("45");

	const progressSizes = [
		{ size: "h-4", class: "" },
		{ size: "h-6", class: "p-2" },
		{ size: "h-8", class: "p-3" },
		{ size: "h-10", class: "p-4" }
	];

	function updateProgressSize(selectedSize) {
		const newSize = progressSizes.find((size) => size.size === selectedSize);

		if (newSize) {
			$.set(progressSize, newSize, true);
		}
	}

	let progressSize = $.state($.proxy(progressSizes[0]));

	// const sizes = [ 'h-4 ', 'h-6', 'h-8', 'h-10'];
	// let progressSize = $state('h-4');
	const colors = Object.keys(progressbar.variants.color);

	let progressColor = $.state("primary");
	let labelInside = $.state(false);

	const changeLabelInside = () => {
		$.set(labelInside, !$.get(labelInside));
	};

	let labelContent = $.prop($$props, 'labelContent', 15, "Svelte-5-Ui-Lib");

	const changeLabelContent = () => {
		labelContent(labelContent() === "Svelte-5-Ui-Lib" ? "" : "Svelte-5-Ui-Lib");
	};

	let animation = $.state(false);
	let tweenDuration = $.state(void 0);
	let easing = $.state(void 0);

	const changeAnimation = () => {
		$.set(animation, !$.get(animation));

		if ($.get(animation)) {
			$.set(tweenDuration, 1500);
			$.set(easing, sineOut, true);
		} else {
			$.set(tweenDuration, undefined);
			$.set(easing, undefined);
		}
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		// progress
		props.push(` progress="${$.get(progress)}"`);

		if ($.get(progressColor) !== "primary") props.push(` color="${$.get(progressColor)}"`);
		if ($.get(labelInside)) props.push(" labelInside");
		if (labelContent() !== "") props.push(` labelOutside="${labelContent()}"`);
		if ($.get(progressSize).size !== "h-4") props.push(` size="${$.get(progressSize).size}"`);

		// Add labelInsideClass prop if not empty
		if ($.get(progressSize).class !== "") {
			props.push(` classes={{ labelInsideClass:"${$.get(progressSize).class}" }}`);
		}

		if ($.get(animation)) {
			props.push(" animate");
			props.push(" precision={0}");
			props.push(" tweenDuration={1500}");
			props.push(" easing={sineOut}");
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Progressbar${propsString} />`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	// end of DynamicCodeBlock setup
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

			var text = $.text('Progressbar Builder');

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

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => ({ label: $.get(progressSize).class }));

							Progressbar($$anchor, {
								get progress() {
									return $.get(progress);
								},

								get size() {
									return $.get(progressSize).size;
								},

								get color() {
									return $.get(progressColor);
								},

								get labelOutside() {
									return labelContent();
								},

								get labelInside() {
									return $.get(labelInside);
								},

								get classes() {
									return $.get($0);
								},
								animate: true,
								get tweenDuration() {
									return $.get(tweenDuration);
								},

								get easing() {
									return $.get(easing);
								}
							});
						}
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => ({ label: $.get(progressSize).class }));

							Progressbar($$anchor, {
								get progress() {
									return $.get(progress);
								},

								get size() {
									return $.get(progressSize).size;
								},

								get color() {
									return $.get(progressColor);
								},

								get labelOutside() {
									return labelContent();
								},

								get labelInside() {
									return $.get(labelInside);
								},

								get classes() {
									return $.get($0);
								}
							});
						}
					};

					$.if(node_3, ($$render) => {
						if ($.get(animation)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_4 = $.child(div_1);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Size');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => progressSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'progress_size',
						get value() {
							return $.get(size).size;
						},
						onchange: () => updateProgressSize($.get(size).size),
						get group() {
							return $.get(progressSize).size;
						},

						set group($$value) {
							$.get(progressSize).size = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(size).size));
							$.append($$anchor, text_2);
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

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => colors, $.index, ($$anchor, color) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'interactive_progress_color',
						get color() {
							return $.get(color);
						},

						get value() {
							return $.get(color);
						},

						get group() {
							return $.get(progressColor);
						},

						set group($$value) {
							$.set(progressColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(color)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Button(node_8, {
					class: 'w-48',
					onclick: changeLabelContent,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, labelContent() ? "Remove outlise label" : "Add outside label"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-48',
					color: 'purple',
					onclick: changeLabelInside,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(labelInside) ? "Remove inside label" : "Add inside label"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-48',
					color: 'red',
					onclick: changeAnimation,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(animation) ? "No animation" : "Animation"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-48',
					color: 'emerald',
					onclick: () => $.set(progress, `${Math.round(Math.random() * 100)}`),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Randomize');

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