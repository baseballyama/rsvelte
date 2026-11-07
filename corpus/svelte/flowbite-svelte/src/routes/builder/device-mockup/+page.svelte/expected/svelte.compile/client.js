import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup, Label, Radio } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<img/> <img/>`, 1);
var root_1 = $.from_html(`<div class="mb-8 flex flex-wrap space-x-2"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Device mockup builder";

	let description = "A quick way to create Device mockup component";
	let title = "Device mockup builder";
	let dir = "builder";

	const devices = [
		{
			name: "Default",
			device: "default",
			lightimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-1-light.png",
				class: "dark:hidden w-[272px] h-[572px]",
				alt: "default example 1"
			},
			darkimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-1-dark.png",
				class: "hidden dark:block w-[272px] h-[572px]",
				alt: "default example 2"
			}
		},

		{
			name: "Ios",
			device: "ios",
			lightimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-2-light.png",
				class: "dark:hidden w-[272px] h-[572px]",
				alt: "ios example 1"
			},
			darkimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-2-dark.png",
				class: "hidden dark:block w-[272px] h-[572px]",
				alt: "ios example 2"
			}
		},

		{
			name: "Android",
			device: "android",
			lightimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-1-light.png",
				class: "dark:hidden w-[272px] h-[572px]",
				alt: "android example 1"
			},
			darkimage: {
				src: "/images/blocks/marketing-ui/hero/mockup-1-dark.png",
				class: "hidden dark:block w-[272px] h-[572px]",
				alt: "android example 2"
			}
		},

		{
			name: "Tablet",
			device: "tablet",
			lightimage: {
				src: "/images/docs/device-mockups/tablet-mockup-image.png",
				class: "dark:hidden h-[426px] md:h-[654px]",
				alt: "tablet example 1"
			},
			darkimage: {
				src: "/images/docs/device-mockups/tablet-mockup-image-dark.png",
				class: "hidden dark:block h-[426px] md:h-[654px]",
				alt: "tablet example 2"
			}
		},

		{
			name: "Laptop",
			device: "laptop",
			lightimage: {
				src: "/images/docs/device-mockups/laptop-screen.png",
				class: "dark:hidden h-[156px] md:h-[278px] w-full rounded-xl",
				alt: "laptop example 1"
			},
			darkimage: {
				src: "/images/docs/device-mockups/laptop-screen-dark.png",
				class: "hidden dark:block h-[156px] md:h-[278px] w-full rounded-lg",
				alt: "laptop example 2"
			}
		},

		{
			name: "Desktop",
			device: "desktop",
			lightimage: {
				src: "/images/docs/device-mockups/screen-image-imac.png",
				class: "dark:hidden h-[140px] md:h-[262px] w-full rounded-xl",
				alt: "desktop example 1"
			},
			darkimage: {
				src: "/images/docs/device-mockups/screen-image-imac-dark.png",
				class: "hidden dark:block h-[140px] md:h-[262px] w-full rounded-xl",
				alt: "desktop example 2"
			}
		},

		{
			name: "Smartwatch",
			device: "smartwatch",
			lightimage: {
				src: "/images/docs/device-mockups/watch-screen-image.png",
				class: "dark:hidden h-[193px] w-[188px",
				alt: "smartwatch example 1"
			},
			darkimage: {
				src: "/images/docs/device-mockups/watch-screen-image-dark.png",
				class: "hidden dark:block h-[193px] w-[188px]",
				alt: "smartwatch example 2"
			}
		}
	];

	const deviceNames = devices.map((device) => device.name);
	let selectedDevice = $.state("Default");
	let currentDevice = $.derived(() => devices.find((d) => d.name === $.get(selectedDevice)) || devices[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(currentDevice).device !== "default") props.push(` device="${$.get(currentDevice).device}"`);

		return `<DeviceMockup${props.join("")}>
  <img src="${$.get(currentDevice).lightimage.src}" class="${$.get(currentDevice).lightimage.class}" alt="${$.get(currentDevice).lightimage.alt}" />
  <img src="${$.get(currentDevice).darkimage.src}" class="${$.get(currentDevice).darkimage.class}" alt="${$.get(currentDevice).darkimage.alt}" />
</DeviceMockup>`;
	})());

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Device Mockup Builder');

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
			innerClass: 'overflow-auto',
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Label(node_3, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Device');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				$.each(node_4, 17, () => deviceNames, $.index, ($$anchor, device) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'alert_reactive',
						get value() {
							return $.get(device);
						},

						get group() {
							return $.get(selectedDevice);
						},

						set group($$value) {
							$.set(selectedDevice, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(device)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_5 = $.sibling(div, 2);

				DeviceMockup(node_5, {
					get device() {
						return $.get(currentDevice).device;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var img = $.first_child(fragment_5);
						var img_1 = $.sibling(img, 2);

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(currentDevice).lightimage.src);
							$.set_class(img, 1, $.clsx($.get(currentDevice).lightimage.class));
							$.set_attribute(img, 'alt', $.get(currentDevice).lightimage.alt);
							$.set_attribute(img_1, 'src', $.get(currentDevice).darkimage.src);
							$.set_class(img_1, 1, $.clsx($.get(currentDevice).darkimage.class));
							$.set_attribute(img_1, 'alt', $.get(currentDevice).darkimage.alt);
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}