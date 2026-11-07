import * as $ from 'svelte/internal/server';
import { DeviceMockup, Label, Radio } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let selectedDevice = "Default";
		let currentDevice = $.derived(() => devices.find((d) => d.name === selectedDevice) || devices[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (currentDevice().device !== "default") props.push(` device="${currentDevice().device}"`);

			return `<DeviceMockup${props.join("")}>
  <img src="${currentDevice().lightimage.src}" class="${currentDevice().lightimage.class}" alt="${currentDevice().lightimage.alt}" />
  <img src="${currentDevice().darkimage.src}" class="${currentDevice().darkimage.class}" alt="${currentDevice().darkimage.alt}" />
</DeviceMockup>`;
		})());

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Device Mockup Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleBuilderExpandClick,
						expand: builderExpand,
						showExpandButton: showBuilderExpandButton(),
						code: generatedCode()
					});
				}

				CodeWrapper($$renderer, {
					innerClass: 'overflow-auto',
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="mb-8 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Device`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(deviceNames);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let device = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'alert_reactive',
								value: device,
								get group() {
									return selectedDevice;
								},

								set group($$value) {
									selectedDevice = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(device)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						DeviceMockup($$renderer, {
							device: currentDevice().device,
							children: ($$renderer) => {
								$$renderer.push(`<img${$.attr('src', currentDevice().lightimage.src)}${$.attr_class($.clsx(currentDevice().lightimage.class))}${$.attr('alt', currentDevice().lightimage.alt)}/> <img${$.attr('src', currentDevice().darkimage.src)}${$.attr_class($.clsx(currentDevice().darkimage.class))}${$.attr('alt', currentDevice().darkimage.alt)}/>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}