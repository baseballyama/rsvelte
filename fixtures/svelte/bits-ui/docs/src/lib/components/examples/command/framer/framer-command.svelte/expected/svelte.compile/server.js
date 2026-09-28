import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

import {
	AvatarIcon,
	BadgeIcon,
	ButtonIcon,
	ContainerIcon,
	InputIcon,
	RadioIcon,
	SearchIcon,
	SliderIcon
} from "./icons/index.js";

import "./framer.css";

export default function Framer_command($$renderer) {
	let value = "Button";

	const components = [
		{
			value: "Button",
			subtitle: "Trigger actions",
			icon: ButtonIcon
		},

		{
			value: "Input",
			subtitle: "Retrieve user input",
			icon: InputIcon
		},

		{
			value: "Radio",
			subtitle: "Single choice input",
			icon: RadioIcon
		},

		{
			value: "Badge",
			subtitle: "Annotate context",
			icon: BadgeIcon
		},

		{
			value: "Slider",
			subtitle: "Free range picker",
			icon: SliderIcon
		},

		{
			value: "Avatar",
			subtitle: "Illustrate the user",
			icon: AvatarIcon
		},

		{
			value: "Container",
			subtitle: "Lay out items",
			icon: ContainerIcon
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="framer">`);

		if (Command.Root) {
			$$renderer.push('<!--[-->');

			Command.Root($$renderer, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div data-command-framer-header="">`);
					SearchIcon($$renderer, {});
					$$renderer.push(`<!----> `);

					if (Command.Input) {
						$$renderer.push('<!--[-->');

						Command.Input($$renderer, {
							autofocus: true,
							placeholder: 'Find components, packages, and interactions...'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> `);

					if (Command.List) {
						$$renderer.push('<!--[-->');

						Command.List($$renderer, {
							children: ($$renderer) => {
								if (Command.Viewport) {
									$$renderer.push('<!--[-->');

									Command.Viewport($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div data-command-framer-items=""><div data-command-framer-left="">`);

											if (Command.Group) {
												$$renderer.push('<!--[-->');

												Command.Group($$renderer, {
													children: ($$renderer) => {
														if (Command.GroupHeading) {
															$$renderer.push('<!--[-->');

															Command.GroupHeading($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Components`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.GroupItems) {
															$$renderer.push('<!--[-->');

															Command.GroupItems($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array = $.ensure_array_like(components);

																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let { value, subtitle, icon } = each_array[$$index];
																		const Icon = icon;

																		if (Command.Item) {
																			$$renderer.push('<!--[-->');

																			Command.Item($$renderer, {
																				value,
																				children: ($$renderer) => {
																					$$renderer.push(`<div data-command-framer-icon-wrapper="">`);

																					if (Icon) {
																						$$renderer.push('<!--[-->');
																						Icon($$renderer, {});
																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(`</div> <div data-command-framer-item-meta="">${$.escape(value)} <span data-command-framer-item-subtitle="">${$.escape(subtitle)}</span></div>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div> <hr data-command-framer-separator=""/> <div data-command-framer-right="">`);

											if (value === "Button") {
												$$renderer.push(`<!--[0--><button>Primary</button>`);
											} else if (value === "Input") {
												$$renderer.push(`<!--[1--><input type="text" placeholder="Placeholder"/>`);
											} else if (value === "Badge") {
												$$renderer.push(`<!--[2--><div data-command-framer-badge="">Badge</div>`);
											} else if (value === "Radio") {
												$$renderer.push(`<!--[3--><label data-command-framer-radio=""><input type="radio" checked=""/> Radio Button</label>`);
											} else if (value === "Avatar") {
												$$renderer.push(`<!--[4--><img src="/rauno.jpeg" alt="Avatar of Rauno"/>`);
											} else if (value === "Slider") {
												$$renderer.push(`<!--[5--><div data-command-framer-slider=""><div></div></div>`);
											} else if (value === "Container") {
												$$renderer.push(`<!--[6--><div data-command-framer-container=""></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}