import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div data-command-framer-icon-wrapper=""><!></div> <div data-command-framer-item-meta=""> <span data-command-framer-item-subtitle=""> </span></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<button>Primary</button>`);
var root_3 = $.from_html(`<input type="text" placeholder="Placeholder"/>`);
var root_4 = $.from_html(`<div data-command-framer-badge="">Badge</div>`);
var root_5 = $.from_html(`<label data-command-framer-radio=""><input type="radio" checked=""/> Radio Button</label>`);
var root_6 = $.from_html(`<img src="/rauno.jpeg" alt="Avatar of Rauno"/>`);
var root_7 = $.from_html(`<div data-command-framer-slider=""><div></div></div>`);
var root_8 = $.from_html(`<div data-command-framer-container=""></div>`);
var root_9 = $.from_html(`<div data-command-framer-items=""><div data-command-framer-left=""><!></div> <hr data-command-framer-separator=""/> <div data-command-framer-right=""><!></div></div>`);
var root_10 = $.from_html(`<div data-command-framer-header=""><!> <!></div> <!>`, 1);
var root_11 = $.from_html(`<div class="framer"><!></div>`);

export default function Framer_command($$anchor) {
	let value = $.state("Button");

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

	var div = root_11();
	var node = $.child(div);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_10();
				var div_1 = $.first_child(fragment);
				var node_1 = $.child(div_1);

				SearchIcon(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						autofocus: true,
						placeholder: 'Find components, packages, and interactions...'
					});
				});

				$.reset(div_1);

				var node_3 = $.sibling(div_1, 2);

				$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div_2 = root_9();
										var div_3 = $.child(div_2);
										var node_5 = $.child(div_3);

										$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
											Command_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_2 = root_1();
													var node_6 = $.first_child(fragment_2);

													$.component(node_6, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
														Command_GroupHeading($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Components');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
														Command_GroupItems($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_3 = $.comment();
																var node_8 = $.first_child(fragment_3);

																$.each(node_8, 17, () => components, ({ value, subtitle, icon }) => value, ($$anchor, $$item, $$index, $$array) => {
																	let value = () => $.get($$item).value;
																	let subtitle = () => $.get($$item).subtitle;
																	let icon = () => $.get($$item).icon;
																	const Icon = $.derived(icon);
																	var fragment_4 = $.comment();
																	var node_9 = $.first_child(fragment_4);

																	$.component(node_9, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return value();
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_5 = root();
																				var div_4 = $.first_child(fragment_5);
																				var node_10 = $.child(div_4);

																				$.component(node_10, () => $.get(Icon), ($$anchor, Icon_1) => {
																					Icon_1($$anchor, {});
																				});

																				$.reset(div_4);

																				var div_5 = $.sibling(div_4, 2);
																				var text_1 = $.child(div_5);
																				var span = $.sibling(text_1);
																				var text_2 = $.only_child(span, true);

																				$.reset(div_5);

																				$.template_effect(() => {
																					$.set_text(text_1, `${value() ?? ''} `);
																					$.set_text(text_2, subtitle());
																				});

																				$.append($$anchor, fragment_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_4);
																});

																$.append($$anchor, fragment_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_2);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_3);

										var div_6 = $.sibling(div_3, 4);
										var node_11 = $.child(div_6);

										{
											var consequent = ($$anchor) => {
												var button = root_2();

												$.append($$anchor, button);
											};

											var consequent_1 = ($$anchor) => {
												var input = root_3();

												$.append($$anchor, input);
											};

											var consequent_2 = ($$anchor) => {
												var div_7 = root_4();

												$.append($$anchor, div_7);
											};

											var consequent_3 = ($$anchor) => {
												var label = root_5();

												$.append($$anchor, label);
											};

											var consequent_4 = ($$anchor) => {
												var img = root_6();

												$.append($$anchor, img);
											};

											var consequent_5 = ($$anchor) => {
												var div_8 = root_7();

												$.append($$anchor, div_8);
											};

											var consequent_6 = ($$anchor) => {
												var div_9 = root_8();

												$.append($$anchor, div_9);
											};

											$.if(node_11, ($$render) => {
												if ($.get(value) === "Button") $$render(consequent); else if ($.get(value) === "Input") $$render(consequent_1, 1); else if ($.get(value) === "Badge") $$render(consequent_2, 2); else if ($.get(value) === "Radio") $$render(consequent_3, 3); else if ($.get(value) === "Avatar") $$render(consequent_4, 4); else if ($.get(value) === "Slider") $$render(consequent_5, 5); else if ($.get(value) === "Container") $$render(consequent_6, 6);
											});
										}

										$.reset(div_6);
										$.reset(div_2);
										$.append($$anchor, div_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}