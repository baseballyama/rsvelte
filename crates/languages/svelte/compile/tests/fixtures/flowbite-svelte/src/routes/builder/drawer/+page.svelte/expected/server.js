import * as $ from 'svelte/internal/server';
import { Drawer, Drawerhead, Button, uiHelpers, Label, Radio } from "$lib";
import { InfoCircleSolid } from "flowbite-svelte-icons";
import { blur, fly, slide, scale, fade } from "svelte/transition";
import { linear, sineIn } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;

		// transition
		// color: Drawer['color'];
		const transitions = [
			{
				name: "Fly",
				transition: fly,
				params: { duration: 300, easing: linear, x: -150 }
			},

			{
				name: "Blur",
				transition: blur,
				params: { duration: 400, easing: sineIn }
			},

			{
				name: "Slide",
				transition: slide,
				params: { duration: 200, easing: linear }
			},

			{
				name: "Scale",
				transition: scale,
				params: { duration: 300, easing: sineIn }
			},

			{
				name: "Fade",
				transition: fade,
				params: { duration: 400, easing: linear }
			}
		];

		let selectedTransition = "Fly";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		const placements = [
			{
				name: "Left",
				placement: "left",
				params: { x: -320, duration: 300, easing: sineIn },
				width: "default"
			},

			{
				name: "Top",
				placement: "top",
				params: { y: -320, duration: 300, easing: sineIn },
				width: "full"
			},

			{
				name: "Right",
				placement: "right",
				params: { x: 320, duration: 300, easing: sineIn },
				width: "default"
			},

			{
				name: "Bottom",
				placement: "bottom",
				params: { y: 320, duration: 300, easing: sineIn },
				width: "full"
			}
		];

		let selectedPlacement = "Left";
		let currentPlacement = $.derived(() => placements.find((p) => p.name === selectedPlacement) || placements[0]);

		// outsideclick
		let outsideclickStatus = true;

		const changeOutsideclickStatus = () => {
			outsideclickStatus = !outsideclickStatus;
		};

		// $effect(() => {
		// 	changeOutsideclickStatus;
		// })
		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (!outsideclickStatus) props.push(" activateClickOutside={false}");
			if (currentPlacement().width !== "default") props.push(` width="${currentPlacement().width}"`);

			if (currentTransition() !== transitions[0]) {
				props.push(` transitionType={${currentTransition().transition.name}}`);

				const paramsString = Object.entries(currentTransition().params).map(([key, value]) => {
					if (key === "easing") {
						// For easing, use the name of the easing function
						return `${key}:${value.name || "linear"}`;
					}

					// For other values, just use the literal value
					return `${key}:${value}`;
				}).join(",");

				props.push(` params={{${paramsString}}}`);
			}

			// placement
			if (currentPlacement() !== placements[0]) {
				props.push(` placement="${currentPlacement().placement}"`);
			}

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Button onclick={drawer.toggle}>Drawer</Button>
<Drawer drawerStatus={drawerStatus} closeDrawer={closeDrawer}${propsString}>
  <Drawerhead onclick={closeDrawer} class="mb-4>
    <h5 id="drawer-label" class="inline-flex items-center text-xl font-semibold text-gray-500 dark:text-gray-400">
        <InfoCircleSolid class="me-2.5 h-5 w-5" />${selectedTransition} drawer
      </h5>
  </Drawerhead>
    My Drawer
</Drawer>`;
		})());

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Drawer Builder`);
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
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="text-center">`);

						Button($$renderer, {
							onclick: () => open = true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Drawer`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> `);

						Drawer($$renderer, {
							transition: currentTransition().transition,
							placement: currentPlacement().placement,
							width: currentPlacement().width,
							transitionParams: currentPlacement().placement === "left"
								? currentTransition().params
								: currentPlacement().params,
							outsideclose: outsideclickStatus,
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								Drawerhead($$renderer, {
									onclick: () => open = false,
									class: 'mb-4',
									children: ($$renderer) => {
										$$renderer.push(`<h5 id="drawer-label" class="inline-flex items-center text-xl font-semibold text-gray-500 dark:text-gray-400">`);
										InfoCircleSolid($$renderer, { class: 'me-2.5 h-5 w-5' });
										$$renderer.push(`<!---->${$.escape(selectedTransition)} drawer</h5>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Content</p> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Outsideclose: ${$.escape(outsideclickStatus ? "true" : "false")}</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transition`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(transitions);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let transition = each_array[$$index];

							Radio($$renderer, {
								classes: { label: "w-16 my-1" },
								name: 'interactive_transition',
								value: transition.name,
								get group() {
									return selectedTransition;
								},

								set group($$value) {
									selectedTransition = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(transition.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Placement`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(placements);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let placement = each_array_1[$$index_1];

							Radio($$renderer, {
								classes: { label: "w-16 my-1" },
								name: 'interactive_placement',
								value: placement.name,
								get group() {
									return selectedPlacement;
								},

								set group($$value) {
									selectedPlacement = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(placement.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-48',
							onclick: changeOutsideclickStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(outsideclickStatus ? "Disable outsideclick" : "Enable outsideclick")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
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