import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Skeleton,
	skeleton,
	CardPlaceholder,
	ImagePlaceholder,
	imagePlaceholder,
	VideoPlaceholder,
	TextPlaceholder,
	ListPlaceholder,
	Label,
	Radio,
	WidgetPlaceholder,
	Button,
	uiHelpers
} from "$lib";

import { HighlightCompo } from "svelte-rune-highlight";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import H2 from "../utils/H2.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="md:h-40"><!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_1 = $.from_html(`<div class="md:h-64"><!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<div class="md:h-64"><!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="md:h-[500px]"><!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];
	const binding_group_4 = [];
	const binding_group_5 = [];
	const binding_group_6 = [];
	const binding_group_7 = [];
	const binding_group_8 = [];

	// MetaTag
	let breadcrumb_title = "Skeleton builder";

	let description = "A quick way to create Skeleton component";
	let title = "Skeleton builder";
	let dir = "builder";

	// size
	const skeletonSizes = Object.keys(skeleton.variants.size);

	let skeletonSize = $.state("sm");
	const imageSizes = Object.keys(imagePlaceholder.variants.size);
	let imagePlaceholderSize = $.state("md");
	let imagePlaceholderRounded = $.state("none");
	const videoSizes = skeletonSizes;
	let videoPlaceholderSize = $.state("sm");
	const imageRoundedSizes = Object.keys(imagePlaceholder.variants.rounded);
	const textSizes = skeletonSizes;
	let textPlaceholderSize = $.state("sm");
	const cardSizes = skeletonSizes;
	let cardPlaceholderSize = $.state("sm");
	const listSizes = imageSizes;
	const listRoundedSizes = imageRoundedSizes;
	const listItemNumbers = [1, 2, 3, 4, 5];
	let listPlaceholderSize = $.state("md");
	let listPlaceholderRounded = $.state("none");
	let listPlaceholderItemNumber = $.state(5);

	// class
	let skeletonClass = $.state("");

	let imagePlaceholderClass = $.state("");
	let videoPlaceholderClass = $.state("");
	let textPlaceholderClass = $.state("");
	let cardPlaceholderClass = $.state("");
	let widgetPlaceholderClass = $.state("");
	let listPlaceholderClass = $.state("");

	// code generator
	const generatePlaceholderCode = (componentName, size, classes) => {
		let props = [];

		if (componentName === "Skeleton" && size !== "sm") props.push(` size="${size}"`);
		if (componentName === "ImagePlaceholder" && size !== "md") props.push(` size="${size}"`);
		if (componentName === "VideoPlaceholder" && size !== "sm") props.push(` size="${size}"`);
		if (componentName === "TextPlaceholder" && size !== "sm") props.push(` size="${size}"`);
		if (componentName === "CardPlaceholder" && size !== "sm") props.push(` size="${size}"`);
		if (componentName === "ListPlaceholder" && size !== "md") props.push(` size="${size}"`);
		if (classes !== "") props.push(` class="${classes}"`);
		if (componentName === "ImagePlaceholder" && $.get(imagePlaceholderRounded) !== "none") props.push(` rounded="${$.get(imagePlaceholderRounded)}"`);
		if (componentName === "ListPlaceholder" && $.get(listPlaceholderItemNumber) !== 5) props.push(` itemNumber={${$.get(listPlaceholderItemNumber)}}`);
		if (componentName === "ListPlaceholder" && $.get(listPlaceholderRounded) !== "none") props.push(` rounded="${$.get(listPlaceholderRounded)}"`);

		return `<${componentName}${props.join("")} />`;
	};

	let generatedCodeSkeleton = $.derived(() => generatePlaceholderCode("Skeleton", $.get(skeletonSize), $.get(skeletonClass)));
	let generatedCodeVideo = $.derived(() => generatePlaceholderCode("VideoPlaceholder", $.get(videoPlaceholderSize), $.get(videoPlaceholderClass)));
	let generatedCodeText = $.derived(() => generatePlaceholderCode("TextPlaceholder", $.get(textPlaceholderSize), $.get(textPlaceholderClass)));
	let generatedCodeCard = $.derived(() => generatePlaceholderCode("CardPlaceholder", $.get(cardPlaceholderSize), $.get(cardPlaceholderClass)));
	let generatedCodeImage = $.derived(() => generatePlaceholderCode("ImagePlaceholder", $.get(imagePlaceholderSize), $.get(imagePlaceholderClass)));
	let generatedCodeWidget = $.derived(() => generatePlaceholderCode("WidgetPlaceholder", "md", $.get(widgetPlaceholderClass)));
	let generatedCodeList = $.derived(() => generatePlaceholderCode("ListPlaceholder", $.get(listPlaceholderSize), $.get(listPlaceholderClass)));

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCodeSkeleton)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_6();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Skeleton Builder');

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
					return $.get(generatedCodeSkeleton);
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Skeleton(node_3, {
					get size() {
						return $.get(skeletonSize);
					},

					get class() {
						return $.get(skeletonClass);
					}
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_4 = $.child(div_1);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Size(width)');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => skeletonSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'skeletonsize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(skeletonSize);
						},

						set group($$value) {
							$.set(skeletonSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(size)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var node_6 = $.sibling(div_1, 2);

				Button(node_6, {
					class: 'w-36',
					onclick: () => $.get(skeletonClass) === ""
						? $.set(skeletonClass, "ml-4")
						: $.set(skeletonClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(skeletonClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_7 = $.sibling(node_2, 2);

	H2(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Image placeholder');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeImage);
				}
			});
		};

		CodeWrapper(node_8, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var div_2 = $.first_child(fragment_7);
				var node_9 = $.child(div_2);

				ImagePlaceholder(node_9, {
					get size() {
						return $.get(imagePlaceholderSize);
					},

					get rounded() {
						return $.get(imagePlaceholderRounded);
					},

					get class() {
						return $.get(imagePlaceholderClass);
					}
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_10 = $.child(div_3);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Size');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => imageSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'imageSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(imagePlaceholderSize);
						},

						set group($$value) {
							$.set(imagePlaceholderSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(size)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_12 = $.child(div_4);

				Label(node_12, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Rounded');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				$.each(node_13, 17, () => imageRoundedSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'imageRoundedSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(imagePlaceholderRounded);
						},

						set group($$value) {
							$.set(imagePlaceholderRounded, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(size)));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var node_14 = $.sibling(div_4, 2);

				Button(node_14, {
					class: 'w-36',
					onclick: () => $.get(imagePlaceholderClass) === ""
						? $.set(imagePlaceholderClass, "ml-4")
						: $.set(imagePlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(imagePlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_15 = $.sibling(node_8, 2);

	H2(node_15, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Video placeholder');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeVideo);
				}
			});
		};

		CodeWrapper(node_16, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_14 = root_2();
				var div_5 = $.first_child(fragment_14);
				var node_17 = $.child(div_5);

				VideoPlaceholder(node_17, {
					get size() {
						return $.get(videoPlaceholderSize);
					},

					get class() {
						return $.get(videoPlaceholderClass);
					}
				});

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_18 = $.child(div_6);

				Label(node_18, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Size(width)');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				$.each(node_19, 17, () => videoSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'videoSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(videoPlaceholderSize);
						},

						set group($$value) {
							$.set(videoPlaceholderSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, $.get(size)));
							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_6);

				var node_20 = $.sibling(div_6, 2);

				Button(node_20, {
					class: 'w-36',
					onclick: () => $.get(videoPlaceholderClass) === ""
						? $.set(videoPlaceholderClass, "ml-4")
						: $.set(videoPlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text();

						$.template_effect(() => $.set_text(text_13, $.get(videoPlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_14);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_21 = $.sibling(node_16, 2);

	H2(node_21, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Text placeholder');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeText);
				}
			});
		};

		CodeWrapper(node_22, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_19 = root_3();
				var node_23 = $.first_child(fragment_19);

				TextPlaceholder(node_23, {
					get size() {
						return $.get(textPlaceholderSize);
					},

					get class() {
						return $.get(textPlaceholderClass);
					}
				});

				var div_7 = $.sibling(node_23, 2);
				var node_24 = $.child(div_7);

				Label(node_24, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text('Size(width)');

						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});

				var node_25 = $.sibling(node_24, 2);

				$.each(node_25, 17, () => textSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'textSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(textPlaceholderSize);
						},

						set group($$value) {
							$.set(textPlaceholderSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text();

							$.template_effect(() => $.set_text(text_16, $.get(size)));
							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_7);

				var node_26 = $.sibling(div_7, 2);

				Button(node_26, {
					class: 'w-36',
					onclick: () => $.get(textPlaceholderClass) === ""
						? $.set(textPlaceholderClass, "ml-4")
						: $.set(textPlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_17 = $.text();

						$.template_effect(() => $.set_text(text_17, $.get(textPlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_17);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_19);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_27 = $.sibling(node_22, 2);

	H2(node_27, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_18 = $.text('Card placeholder');

			$.append($$anchor, text_18);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_27, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeCard);
				}
			});
		};

		CodeWrapper(node_28, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_24 = root_3();
				var node_29 = $.first_child(fragment_24);

				CardPlaceholder(node_29, {
					get size() {
						return $.get(cardPlaceholderSize);
					},

					get class() {
						return $.get(cardPlaceholderClass);
					}
				});

				var div_8 = $.sibling(node_29, 2);
				var node_30 = $.child(div_8);

				Label(node_30, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_19 = $.text('Size(width)');

						$.append($$anchor, text_19);
					},
					$$slots: { default: true }
				});

				var node_31 = $.sibling(node_30, 2);

				$.each(node_31, 17, () => cardSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'cardSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(cardPlaceholderSize);
						},

						set group($$value) {
							$.set(cardPlaceholderSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text();

							$.template_effect(() => $.set_text(text_20, $.get(size)));
							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_8);

				var node_32 = $.sibling(div_8, 2);

				Button(node_32, {
					class: 'w-36',
					onclick: () => $.get(cardPlaceholderClass) === ""
						? $.set(cardPlaceholderClass, "ml-4")
						: $.set(cardPlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_21 = $.text();

						$.template_effect(() => $.set_text(text_21, $.get(cardPlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_21);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_24);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_33 = $.sibling(node_28, 2);

	H2(node_33, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_22 = $.text('Widget placeholder');

			$.append($$anchor, text_22);
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_33, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeWidget);
				}
			});
		};

		CodeWrapper(node_34, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_29 = root_4();
				var node_35 = $.first_child(fragment_29);

				WidgetPlaceholder(node_35, {
					get class() {
						return $.get(widgetPlaceholderClass);
					}
				});

				var node_36 = $.sibling(node_35, 2);

				Button(node_36, {
					class: 'mt-4 w-36',
					onclick: () => $.get(widgetPlaceholderClass) === ""
						? $.set(widgetPlaceholderClass, "ml-4")
						: $.set(widgetPlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_23 = $.text();

						$.template_effect(() => $.set_text(text_23, $.get(widgetPlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_23);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_29);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_37 = $.sibling(node_34, 2);

	H2(node_37, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_24 = $.text('List placeholder');

			$.append($$anchor, text_24);
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_37, 2);

	{
		const codeblock = ($$anchor) => {
			HighlightCompo($$anchor, {
				get code() {
					return $.get(generatedCodeList);
				}
			});
		};

		CodeWrapper(node_38, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_32 = root_5();
				var div_9 = $.first_child(fragment_32);
				var node_39 = $.child(div_9);

				ListPlaceholder(node_39, {
					get itemNumber() {
						return $.get(listPlaceholderItemNumber);
					},

					get size() {
						return $.get(listPlaceholderSize);
					},

					get rounded() {
						return $.get(listPlaceholderRounded);
					},

					get class() {
						return $.get(listPlaceholderClass);
					}
				});

				$.reset(div_9);

				var div_10 = $.sibling(div_9, 2);
				var node_40 = $.child(div_10);

				Label(node_40, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_25 = $.text('Size');

						$.append($$anchor, text_25);
					},
					$$slots: { default: true }
				});

				var node_41 = $.sibling(node_40, 2);

				$.each(node_41, 17, () => listSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(listPlaceholderSize);
						},

						set group($$value) {
							$.set(listPlaceholderSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_26 = $.text();

							$.template_effect(() => $.set_text(text_26, $.get(size)));
							$.append($$anchor, text_26);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_10);

				var div_11 = $.sibling(div_10, 2);
				var node_42 = $.child(div_11);

				Label(node_42, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_27 = $.text('Rounded');

						$.append($$anchor, text_27);
					},
					$$slots: { default: true }
				});

				var node_43 = $.sibling(node_42, 2);

				$.each(node_43, 17, () => listRoundedSizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'roundedSize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(listPlaceholderRounded);
						},

						set group($$value) {
							$.set(listPlaceholderRounded, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text();

							$.template_effect(() => $.set_text(text_28, $.get(size)));
							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_11);

				var div_12 = $.sibling(div_11, 2);
				var node_44 = $.child(div_12);

				Label(node_44, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_29 = $.text('Items:');

						$.append($$anchor, text_29);
					},
					$$slots: { default: true }
				});

				var node_45 = $.sibling(node_44, 2);

				$.each(node_45, 17, () => listItemNumbers, $.index, ($$anchor, itemNumber) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-10" },
						name: 'itemNumber',
						get value() {
							return $.get(itemNumber);
						},

						get group() {
							return $.get(listPlaceholderItemNumber);
						},

						set group($$value) {
							$.set(listPlaceholderItemNumber, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text();

							$.template_effect(() => $.set_text(text_30, $.get(itemNumber)));
							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_12);

				var node_46 = $.sibling(div_12, 2);

				Button(node_46, {
					class: 'w-36',
					onclick: () => $.get(listPlaceholderClass) === ""
						? $.set(listPlaceholderClass, "ml-4")
						: $.set(listPlaceholderClass, ""),

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_31 = $.text();

						$.template_effect(() => $.set_text(text_31, $.get(listPlaceholderClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_31);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_32);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}