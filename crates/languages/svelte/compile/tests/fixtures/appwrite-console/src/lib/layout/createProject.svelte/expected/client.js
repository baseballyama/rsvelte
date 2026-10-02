import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout, Typography, Input, Tag, Icon, Alert } from '@appwrite.io/pink-svelte';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import { CustomId } from '$lib/components/index.js';
import { getFlagUrl } from '$lib/helpers/flag';
import { isCloud } from '$lib/system.js';
import { Button } from '$lib/elements/forms';
import { page } from '$app/state';
import { filterRegions } from '$lib/helpers/regions';
import { formatCurrency } from '$lib/helpers/numbers';
import { resolve } from '$app/paths';

var root = $.from_html(`<link rel="preload" as="image"/>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function CreateProject($$anchor, $$props) {
	$.push($$props, true);

	let projectName = $.prop($$props, 'projectName', 15),
		id = $.prop($$props, 'id', 15),
		regions = $.prop($$props, 'regions', 19, () => []),
		region = $.prop($$props, 'region', 15),
		showTitle = $.prop($$props, 'showTitle', 3, true),
		currentPlan = $.prop($$props, 'currentPlan', 3, undefined),
		projects = $.prop($$props, 'projects', 3, undefined);

	let showCustomId = $.state(false);

	const projectsLimited = $.derived(() => {
		return currentPlan()?.projects > 0 && projects() && projects() >= currentPlan()?.projects;
	});

	const isAddonProject = $.derived(() => {
		return currentPlan()?.addons?.projects?.supported && projects() && projects() >= currentPlan()?.addons?.projects?.planIncluded;
	});

	var fragment_1 = $.comment();

	$.head('1ldhm9b', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, regions, $.index, ($$anchor, region, $$index, $$array) => {
			var link = root();

			$.template_effect(($0) => $.set_attribute(link, 'href', $0), [() => getFlagUrl($.get(region).flag)]);
			$.append($$anchor, link);
		});

		$.append($$anchor, fragment);
	});

	var node_1 = $.first_child(fragment_1);

	$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			direction: 'column',
			gap: 'xxl',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
							Typography_Title($$anchor, {
								size: 'l',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Create your project');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_2, ($$render) => {
						if (showTitle()) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'column',
						gap: 'xxl',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									direction: 'column',
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_4();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
											Layout_Stack_3($$anchor, {
												direction: 'column',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => Input.Text, ($$anchor, Input_Text) => {
														Input_Text($$anchor, {
															get disabled() {
																return $.get(projectsLimited);
															},
															label: 'Name',
															placeholder: 'Project name',
															required: true,
															autofocus: true,
															get value() {
																return projectName();
															},

															set value($$value) {
																projectName($$value);
															}
														});
													});

													var node_8 = $.sibling(node_7, 2);

													{
														var consequent_1 = ($$anchor) => {
															var div = root_1();
															var node_9 = $.child(div);

															Tag(node_9, {
																size: 's',
																$$events: {
																	click: () => {
																		$.set(showCustomId, true);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Project ID');

																	$.append($$anchor, text_1);
																},

																$$slots: {
																	start: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			get icon() {
																				return IconPencil;
																			},
																			slot: 'start',
																			size: 's'
																		});
																	},
																	default: true
																}
															});

															$.reset(div);
															$.append($$anchor, div);
														};

														$.if(node_8, ($$render) => {
															if (!$.get(showCustomId)) $$render(consequent_1);
														});
													}

													var node_10 = $.sibling(node_8, 2);

													CustomId(node_10, {
														name: 'Project',
														isProject: true,
														get show() {
															return $.get(showCustomId);
														},

														set show($$value) {
															$.set(showCustomId, $$value, true);
														},

														get id() {
															return id();
														},

														set id($$value) {
															id($$value);
														}
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_6, 2);

										{
											var consequent_2 = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
													Layout_Stack_4($$anchor, {
														gap: 'xs',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_3();
															var node_13 = $.first_child(fragment_9);

															{
																let $0 = $.derived(() => filterRegions(regions()));

																$.component(node_13, () => Input.Select, ($$anchor, Input_Select) => {
																	Input_Select($$anchor, {
																		get disabled() {
																			return $.get(projectsLimited);
																		},
																		required: true,
																		placeholder: 'Select a region',
																		get options() {
																			return $.get($0);
																		},
																		label: 'Region',
																		get value() {
																			return region();
																		},

																		set value($$value) {
																			region($$value);
																		}
																	});
																});
															}

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Region cannot be changed after creation');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											};

											$.if(node_11, ($$render) => {
												if (isCloud && regions().length > 0) $$render(consequent_2);
											});
										}

										var node_15 = $.sibling(node_11, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_10 = $.comment();
												var node_16 = $.first_child(fragment_10);

												{
													let $0 = $.derived(() => formatCurrency(currentPlan()?.addons?.projects?.price || 15));

													$.component(node_16, () => Alert.Inline, ($$anchor, Alert_Inline) => {
														Alert_Inline($$anchor, {
															status: 'info',
															get title() {
																return `Expand for ${$.get($0) ?? ''}/project per month`;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Each added project comes with its own dedicated pool of resources.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_10);
											};

											$.if(node_15, ($$render) => {
												if ($.get(isAddonProject)) $$render(consequent_3);
											});
										}

										var node_17 = $.sibling(node_15, 2);

										{
											var consequent_4 = ($$anchor) => {
												var fragment_11 = $.comment();
												var node_18 = $.first_child(fragment_11);

												{
													let $0 = $.derived(() => `You've reached your limit of ${currentPlan()?.projects} projects`);

													$.component(node_18, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
														Alert_Inline_1($$anchor, {
															status: 'warning',
															get title() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Extra projects are available on paid plans for an additional fee');

																$.append($$anchor, text_4);
															},

															$$slots: {
																default: true,
																actions: ($$anchor, $$slotProps) => {
																	{
																		let $0 = $.derived(() => resolve('/(console)/organization-[organization]/billing', { organization: page.params.organization }));

																		Button($$anchor, {
																			compact: true,
																			size: 's',
																			get href() {
																				return $.get($0);
																			},
																			external: true,
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Upgrade');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	}
																}
															}
														});
													});
												}

												$.append($$anchor, fragment_11);
											};

											$.if(node_17, ($$render) => {
												if ($.get(projectsLimited)) $$render(consequent_4);
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_19 = $.sibling(node_4, 2);

				$.snippet(node_19, () => $$props.submit ?? $.noop);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_1);
	$.pop();
}