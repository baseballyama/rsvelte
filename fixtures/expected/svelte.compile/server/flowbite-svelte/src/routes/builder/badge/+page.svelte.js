import * as $ from 'svelte/internal/server';
import { Badge, badge, Button, Radio, Label, uiHelpers } from "$lib";
import { ClockSolid } from "flowbite-svelte-icons";
import { blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Badge builder";

		let description = "A quick way to create Badge component";
		let title = "Badge builder";
		let dir = "builder";

		// interactive example
		const colors = Object.keys(badge.variants.color);

		let color = "primary";
		let badgeSize = false;

		const changeSize = () => {
			badgeSize = !badgeSize;
		};

		let badgeDismissable = false;

		const changeDismissable = () => {
			badgeDismissable = !badgeDismissable;
		};

		let badgeClass = "";

		const changeClass = () => {
			badgeClass = badgeClass === "" ? "w-40 p-2" : "";
		};

		let badgeStatus2 = true;

		const changeStatus = () => {
			badgeStatus2 = true;
		};

		let border = false;

		const changeBorder = () => {
			border = !border;
		};

		let rounded = false;

		const changeRounded = () => {
			rounded = !rounded;
		};

		let link = "";

		const changeLink = () => {
			link = link === "" ? "/" : "";
		};

		let iconSlot = false;

		const changeIconSlot = () => {
			iconSlot = !iconSlot;
		};

		// transition example
		const transitions = [
			{
				name: "Fly",
				transition: fly,
				params: { duration: 500, easing: linear, x: 150 },
				color: "blue"
			},

			{
				name: "Blur",
				transition: blur,
				params: { duration: 500, easing: linear },
				color: "lime"
			},

			{
				name: "Slide",
				transition: slide,
				params: { duration: 500, easing: linear, x: -150 },
				color: "violet"
			},

			{
				name: "Scale",
				transition: scale,
				params: { duration: 500, easing: linear },
				color: "pink"
			}
		];

		let selectedTransition = "Fly";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		let generatedCode = $.derived(() => (() => {
			let importScript = currentTransition() !== transitions[0]
				? ` // script tag 
				import { ${currentTransition()} } from 'svelte/transition'`
				: "";

			let props = [];

			if (color !== "primary") props.push(` color="${color}"`);
			if (badgeSize) props.push(" large");
			if (badgeDismissable) props.push(" dismissable");
			if (badgeClass) props.push(` class="${badgeClass}"`);
			if (!badgeStatus2) props.push(" badgeStatus={false}");
			if (border) props.push(" border");
			if (link) props.push(` href="${link}"`);
			if (rounded) props.push(" rounded");

			if (currentTransition() !== transitions[0] && badgeDismissable) {
				props.push(` transition={${currentTransition().name.toLowerCase()}}`);

				// Generate params string without quotes and handle functions
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

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			if (iconSlot) {
				return importScript + `<Badge${propsString}>
  <ClockSolid class="me-1.5 h-4 w-4" />
  My Badge
</Badge>`;
			} else {
				return `<Badge${propsString}>My Badge</Badge>`;
			}
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
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Badge Builder`);
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
						$$renderer.push(`<div class="mb-4 h-10">`);

						Badge($$renderer, {
							color,
							large: badgeSize,
							dismissable: badgeDismissable,
							class: badgeClass,
							border,
							rounded,
							transition: currentTransition().transition,
							params: currentTransition().params,
							href: link,
							get badgeStatus() {
								return badgeStatus2;
							},

							set badgeStatus($$value) {
								badgeStatus2 = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (iconSlot) {
									$$renderer.push('<!--[0-->');
									ClockSolid($$renderer, { class: 'my-1 me-1.5 h-4 w-4' });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> My Badge`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 h-12">`);

						Button($$renderer, {
							disabled: badgeStatus2 ? true : false,
							onclick: changeStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open badge`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let colorOption = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'color',
								color: colorOption,
								value: colorOption,
								get group() {
									return color;
								},

								set group($$value) {
									color = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transition`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(transitions);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let transition = each_array_1[$$index_1];

							Radio($$renderer, {
								disabled: badgeDismissable ? false : true,
								classes: {
									label: "w-16 my-1 {badgeDismissable ? '' : 'opacity-30 cursor-not-allowed'}"
								},
								name: 'transition_interactive',
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

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeSize,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(badgeSize ? "Small" : "Large")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'green',
							onclick: changeDismissable,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(badgeDismissable ? "Not dismissable" : "Dismissable")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'purple',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(badgeClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'yellow',
							onclick: changeBorder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(border ? "Remove border" : "Add border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'dark',
							onclick: changeRounded,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(rounded ? "Remove rounded" : "Add rounded")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'pink',
							onclick: changeLink,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(link ? "Remove href" : "Add href")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'teal',
							onclick: changeIconSlot,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(iconSlot ? "Remove icon" : "Add icon")}`);
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