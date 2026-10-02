import * as $ from 'svelte/internal/server';
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";

import {
	Button,
	Radio,
	Dropdown,
	DropdownDivider,
	DropdownHeader,
	DropdownItem,
	uiHelpers,
	Label
} from "$lib";

import { ChevronDownOutline } from "flowbite-svelte-icons";
import { blur, fly, slide, scale } from "svelte/transition";
import { sineIn, linear } from "svelte/easing";
import { page } from "$app/state";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;

		// MetaTag
		let breadcrumb_title = "Dropdown builder";

		let description = "A quick way to create Dropdown component";
		let title = "Dropdown builder";
		let dir = "builder";
		let dropdownDividerHeaderFooter = uiHelpers();
		let dividerStatus = false;

		const changeDividerStatus = () => {
			dividerStatus = !dividerStatus;
		};

		let headerStatus = false;

		const changeHeaderStatus = () => {
			headerStatus = !headerStatus;
		};

		let footerStatus = false;

		const changeFooterStatus = () => {
			footerStatus = !footerStatus;
		};

		// transition
		const transitions = [
			{
				name: "Fly",
				transition: fly,
				params: { y: 0, duration: 200, easing: sineIn }
			},

			{
				name: "Blur",
				transition: blur,
				params: { y: 0, duration: 400, easing: linear }
			},

			{
				name: "Slide",
				transition: slide,
				params: { x: -100, duration: 300, easing: sineIn }
			},

			{
				name: "Scale",
				transition: scale,
				params: { duration: 300, easing: linear }
			}
		];

		let selectedTransition = "Fly";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let headerContent = headerStatus
				? ` 
    <DropdownHeader>
      <div>Bonnie Green</div>
      <div class="truncate font-medium">name@flowbite.com</div>
    </DropdownHeader>`
				: "";

			let footerContent = footerStatus
				? `
    <DropdownFooter>
      <div class="py-2">
        <a href="/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
      </div>
    </DropdownFooter>`
				: "";

			let dividerContent = dividerStatus
				? `
      <DropdownDivider />`
				: "";

			let props = [];

			if (currentTransition() !== transitions[0]) {
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

			return `<div class="flex items-start justify-center">
  <Button onclick={dropdownA.toggle}>Dropdown
    <ChevronDownOutline class="ms-2 h-5 w-5 text-white dark:text-white" />
  </Button>
  <div class="relative h-96">
    <Dropdown {activeUrl}${propsString} dropdownStatus={dropdownAStatus} closeDropdown={closeDropdownA} class="absolute -left-[150px] top-[40px]">${headerContent}
      <DropdownUl>
        <DropdownLi href="/">Dashboard</DropdownLi>${dividerContent}
        <DropdownLi href="/components/dropdown">Dropdown</DropdownLi>
      </DropdownUl>${footerContent}
    </Dropdown>
  </div>
</div>`;
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
					$$renderer.push(`<!---->Dropdown Builder`);
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
						$$renderer.push(`<div class="flex items-start justify-center">`);

						Button($$renderer, {
							onclick: dropdownDividerHeaderFooter.toggle,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Dropdown `);
								ChevronDownOutline($$renderer, { class: 'ms-2 h-5 w-5 text-white dark:text-white' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="relative h-96">`);

						Dropdown($$renderer, {
							activeUrl,
							class: 'absolute top-[40px] -left-[150px]',
							children: ($$renderer) => {
								if (headerStatus) {
									$$renderer.push('<!--[0-->');

									DropdownHeader($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div>Bonnie Green</div> <div class="truncate font-medium">name@flowbite.com</div>`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								DropdownItem($$renderer, {
									href: '/',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Dashboard`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (dividerStatus) {
									$$renderer.push('<!--[0-->');
									DropdownDivider($$renderer, {});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								DropdownItem($$renderer, {
									href: '/components/dropdown',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Dropdown`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								DropdownItem($$renderer, {
									href: '/components/footer',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Footer`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								DropdownItem($$renderer, {
									href: '/components',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Alert`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="mb-4 flex gap-4">`);

						Button($$renderer, {
							onclick: changeHeaderStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Header `);

								if (headerStatus) {
									$$renderer.push(`<!--[0-->off`);
								} else {
									$$renderer.push(`<!--[-1-->on`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: changeFooterStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Footer `);

								if (footerStatus) {
									$$renderer.push(`<!--[0-->off`);
								} else {
									$$renderer.push(`<!--[-1-->on`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: changeDividerStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Divider `);

								if (dividerStatus) {
									$$renderer.push(`<!--[0-->off`);
								} else {
									$$renderer.push(`<!--[-1-->on`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex flex-wrap space-x-2">`);

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
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'dropdown_transition',
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

						$$renderer.push(`<!--]--></div>`);
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