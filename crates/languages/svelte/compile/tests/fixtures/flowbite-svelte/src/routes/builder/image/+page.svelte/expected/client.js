import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img, img, Badge, Radio, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="relative mb-4 overflow-y-auto md:h-[700px]"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Image builder";

	let description = "A quick way to create Image component";
	let title = "Image builder";
	let dir = "builder";
	const sizes = Object.keys(img.variants.size);
	let imgSize = $.state(undefined);

	// const alignments = Object.keys(img.variants.alignment);
	// let imgAlignment: ImgProps['alignment'] = $state('left');
	const effects = Object.keys(img.variants.effect);

	let imgEffect = $.state(undefined);

	// const shadows = Object.keys(img.variants.shadow);
	// let imgShadow: ImgProps['shadow'] = $state('none');
	// const roundeds = Object.keys(img.variants.rounded);
	// let imgRounded: ImgProps['rounded'] = $state('none');
	let imgClass = "mx-auto";

	let imgCaption = $.state(false);

	const changeImgCaption = () => {
		$.set(imgCaption, !$.get(imgCaption));
	};

	let imgHref = $.state("");

	const changeImgHrf = () => {
		$.set(imgHref, $.get(imgHref) === "" ? "/" : "", true);
	};

	$.user_effect(() => {
		if ($.get(imgSize) !== undefined) {
			$.set(imgEffect, undefined);
		}
	});

	// code generator
	let generatedCode = $.derived(() => (() => {
		// size, alignment, effect, shadow, rounded, caption, imgClass, figClass, captionClass,
		let props = [];

		if ($.get(imgSize) !== undefined) props.push(` size="${$.get(imgSize)}"`);

		// if (imgAlignment !== 'left') props.push(` alignment="${imgAlignment}"`);
		if ($.get(imgEffect) !== undefined) props.push(` effect="${$.get(imgEffect)}"`);

		// if (imgShadow !== 'none') props.push(` shadow="${imgShadow}"`);
		// if (imgRounded !== 'none') props.push(` rounded="${imgRounded}"`);
		if ($.get(imgEffect) !== undefined && $.get(imgCaption)) props.push(` figClass="relative max-w-sm transition-all duration-300 cursor-pointer filter grayscale hover:grayscale-0"`);

		if ($.get(imgEffect) !== undefined && $.get(imgCaption)) props.push(` captionClass="absolute bottom-6 px-4 text-lg text-white"`);
		if ($.get(imgCaption)) props.push(` caption="Image caption"`);
		if ($.get(imgHref)) props.push(` href="/"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Img${propsString} src='/images/examples/content-gallery-3.png'/>`;
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

			var text = $.text('Image Builder');

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
					let $0 = $.derived(() => $.get(imgEffect) !== undefined
						? "/images/examples/content-gallery-3.png"
						: imgClass.includes("full")
							? "/images/examples/image-4@2x.jpg"
							: "/images/examples/image-1@2x.jpg");

					let $1 = $.derived(() => $.get(imgEffect) !== undefined && $.get(imgCaption)
						? "relative max-w-sm transition-all duration-300 cursor-pointer filter grayscale hover:grayscale-0"
						: "");

					let $2 = $.derived(() => $.get(imgEffect) !== undefined && $.get(imgCaption)
						? "absolute bottom-6 px-4 text-lg text-white mx-auto"
						: "");

					let $3 = $.derived(() => $.get(imgEffect) !== undefined
						? "Do you want to get notified when a new component is added to Flowbite?"
						: $.get(imgCaption) ? "Image caption" : "");

					Img(node_3, {
						get src() {
							return $.get($0);
						},

						get size() {
							return $.get(imgSize);
						},
						class: imgClass,
						alt: 'sample 1',
						get effect() {
							return $.get(imgEffect);
						},

						get figClass() {
							return $.get($1);
						},

						get captionClass() {
							return $.get($2);
						},

						get caption() {
							return $.get($3);
						},

						get href() {
							return $.get(imgHref);
						}
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

				$.each(node_5, 17, () => sizes, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'img_size',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(imgSize);
						},

						set group($$value) {
							$.set(imgSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(option)));
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

						var text_3 = $.text('Effect');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => effects, $.index, ($$anchor, effect) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'img_effect',
						get value() {
							return $.get(effect);
						},

						get group() {
							return $.get(imgEffect);
						},

						set group($$value) {
							$.set(imgEffect, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(effect)));
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
					color: 'blue',
					onclick: changeImgCaption,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(imgCaption) ? "Remove caption" : "Add caption"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-48',
					color: 'lime',
					onclick: changeImgHrf,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(imgHref) === "" ? "Add href" : "Remove href"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	var node_10 = $.sibling(node_2, 2);

	Badge(node_10, {
		large: true,
		class: 'my-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Warning: the caption is using @html.');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}