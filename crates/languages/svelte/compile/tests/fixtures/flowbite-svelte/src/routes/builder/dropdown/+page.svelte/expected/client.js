import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Dropdown <!>`, 1);
var root_1 = $.from_html(`<div>Bonnie Green</div> <div class="truncate font-medium">name@flowbite.com</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`Header <!>`, 1);
var root_4 = $.from_html(`Footer <!>`, 1);
var root_5 = $.from_html(`Divider <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-start justify-center"><!> <div class="relative h-96"><!></div></div> <div class="mb-4 flex gap-4"><!> <!> <!></div> <div class="flex flex-wrap space-x-2"><!> <!></div>`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let activeUrl = $.state($.proxy(page.url.pathname));

	$.user_effect(() => {
		$.set(activeUrl, page.url.pathname, true);
	});

	// MetaTag
	let breadcrumb_title = "Dropdown builder";

	let description = "A quick way to create Dropdown component";
	let title = "Dropdown builder";
	let dir = "builder";
	let dropdownDividerHeaderFooter = uiHelpers();
	let dividerStatus = $.state(false);

	const changeDividerStatus = () => {
		$.set(dividerStatus, !$.get(dividerStatus));
	};

	let headerStatus = $.state(false);

	const changeHeaderStatus = () => {
		$.set(headerStatus, !$.get(headerStatus));
	};

	let footerStatus = $.state(false);

	const changeFooterStatus = () => {
		$.set(footerStatus, !$.get(footerStatus));
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

	let selectedTransition = $.state("Fly");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let headerContent = $.get(headerStatus)
			? ` 
    <DropdownHeader>
      <div>Bonnie Green</div>
      <div class="truncate font-medium">name@flowbite.com</div>
    </DropdownHeader>`
			: "";

		let footerContent = $.get(footerStatus)
			? `
    <DropdownFooter>
      <div class="py-2">
        <a href="/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
      </div>
    </DropdownFooter>`
			: "";

		let dividerContent = $.get(dividerStatus)
			? `
      <DropdownDivider />`
			: "";

		let props = [];

		if ($.get(currentTransition) !== transitions[0]) {
			props.push(` transition={${$.get(currentTransition).name.toLowerCase()}}`);

			// Generate params string without quotes and handle functions
			const paramsString = Object.entries($.get(currentTransition).params).map(([key, value]) => {
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

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_7();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Dropdown Builder');

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
				var fragment_2 = root_6();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Button(node_3, {
					get onclick() {
						return dropdownDividerHeaderFooter.toggle;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_3 = root();
						var node_4 = $.sibling($.first_child(fragment_3));

						ChevronDownOutline(node_4, { class: 'ms-2 h-5 w-5 text-white dark:text-white' });
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var div_1 = $.sibling(node_3, 2);
				var node_5 = $.child(div_1);

				Dropdown(node_5, {
					get activeUrl() {
						return $.get(activeUrl);
					},
					class: 'absolute top-[40px] -left-[150px]',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_2();
						var node_6 = $.first_child(fragment_4);

						{
							var consequent = ($$anchor) => {
								DropdownHeader($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();

										$.next(2);
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_6, ($$render) => {
								if ($.get(headerStatus)) $$render(consequent);
							});
						}

						var node_7 = $.sibling(node_6, 2);

						DropdownItem(node_7, {
							href: '/',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Dashboard');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						{
							var consequent_1 = ($$anchor) => {
								DropdownDivider($$anchor, {});
							};

							$.if(node_8, ($$render) => {
								if ($.get(dividerStatus)) $$render(consequent_1);
							});
						}

						var node_9 = $.sibling(node_8, 2);

						DropdownItem(node_9, {
							href: '/components/dropdown',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Dropdown');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_10 = $.sibling(node_9, 2);

						DropdownItem(node_10, {
							href: '/components/footer',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Footer');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_11 = $.sibling(node_10, 2);

						DropdownItem(node_11, {
							href: '/components',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Alert');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_12 = $.child(div_2);

				Button(node_12, {
					onclick: changeHeaderStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_8 = root_3();
						var node_13 = $.sibling($.first_child(fragment_8));

						{
							var consequent_2 = ($$anchor) => {
								var text_5 = $.text('off');

								$.append($$anchor, text_5);
							};

							var alternate = ($$anchor) => {
								var text_6 = $.text('on');

								$.append($$anchor, text_6);
							};

							$.if(node_13, ($$render) => {
								if ($.get(headerStatus)) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_12, 2);

				Button(node_14, {
					onclick: changeFooterStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_9 = root_4();
						var node_15 = $.sibling($.first_child(fragment_9));

						{
							var consequent_3 = ($$anchor) => {
								var text_7 = $.text('off');

								$.append($$anchor, text_7);
							};

							var alternate_1 = ($$anchor) => {
								var text_8 = $.text('on');

								$.append($$anchor, text_8);
							};

							$.if(node_15, ($$render) => {
								if ($.get(footerStatus)) $$render(consequent_3); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_14, 2);

				Button(node_16, {
					onclick: changeDividerStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_10 = root_5();
						var node_17 = $.sibling($.first_child(fragment_10));

						{
							var consequent_4 = ($$anchor) => {
								var text_9 = $.text('off');

								$.append($$anchor, text_9);
							};

							var alternate_2 = ($$anchor) => {
								var text_10 = $.text('on');

								$.append($$anchor, text_10);
							};

							$.if(node_17, ($$render) => {
								if ($.get(dividerStatus)) $$render(consequent_4); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_18 = $.child(div_3);

				Label(node_18, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Transition');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				$.each(node_19, 17, () => transitions, $.index, ($$anchor, transition) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'dropdown_transition',
						get value() {
							return $.get(transition).name;
						},

						get group() {
							return $.get(selectedTransition);
						},

						set group($$value) {
							$.set(selectedTransition, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, $.get(transition).name));
							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});
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