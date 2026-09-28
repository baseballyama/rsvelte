import * as $ from 'svelte/internal/server';
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

export default function CreateProject($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			projectName = void 0,
			id = void 0,
			regions = [],
			region = void 0,
			showTitle = true,
			currentPlan = undefined,
			projects = undefined,
			submit
		} = $$props;

		let showCustomId = false;

		const projectsLimited = $.derived(() => {
			return currentPlan?.projects > 0 && projects && projects >= currentPlan?.projects;
		});

		const isAddonProject = $.derived(() => {
			return currentPlan?.addons?.projects?.supported && projects && projects >= currentPlan?.addons?.projects?.planIncluded;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1ldhm9b', $$renderer, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(regions);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let region = each_array[$$index];

					$$renderer.push(`<link rel="preload" as="image"${$.attr('href', getFlagUrl(region.flag))}/>`);
				}

				$$renderer.push(`<!--]-->`);
			});

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					direction: 'column',
					gap: 'xxl',
					children: ($$renderer) => {
						if (showTitle) {
							$$renderer.push('<!--[0-->');

							if (Typography.Title) {
								$$renderer.push('<!--[-->');

								Typography.Title($$renderer, {
									size: 'l',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create your project`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'column',
								gap: 'xxl',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'column',
											gap: 'xxl',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'column',
														gap: 's',
														children: ($$renderer) => {
															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	disabled: projectsLimited(),
																	label: 'Name',
																	placeholder: 'Project name',
																	required: true,
																	autofocus: true,
																	get value() {
																		return projectName;
																	},

																	set value($$value) {
																		projectName = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (!showCustomId) {
																$$renderer.push(`<!--[0--><div>`);

																Tag($$renderer, {
																	size: 's',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Project ID`);
																	},

																	$$slots: {
																		start: ($$renderer) => {
																			Icon($$renderer, { icon: IconPencil, slot: 'start', size: 's' });
																		},
																		default: true
																	}
																});

																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															CustomId($$renderer, {
																name: 'Project',
																isProject: true,
																get show() {
																	return showCustomId;
																},

																set show($$value) {
																	showCustomId = $$value;
																	$$settled = false;
																},

																get id() {
																	return id;
																},

																set id($$value) {
																	id = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (isCloud && regions.length > 0) {
													$$renderer.push('<!--[0-->');

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'xs',
															children: ($$renderer) => {
																if (Input.Select) {
																	$$renderer.push('<!--[-->');

																	Input.Select($$renderer, {
																		disabled: projectsLimited(),
																		required: true,
																		placeholder: 'Select a region',
																		options: filterRegions(regions),
																		label: 'Region',
																		get value() {
																			return region;
																		},

																		set value($$value) {
																			region = $$value;
																			$$settled = false;
																		}
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Region cannot be changed after creation`);
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
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (isAddonProject()) {
													$$renderer.push('<!--[0-->');

													if (Alert.Inline) {
														$$renderer.push('<!--[-->');

														Alert.Inline($$renderer, {
															status: 'info',
															title: `Expand for ${$.stringify(formatCurrency(currentPlan?.addons?.projects?.price || 15))}/project per month`,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Each added project comes with its own dedicated pool of resources.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (projectsLimited()) {
													$$renderer.push('<!--[0-->');

													if (Alert.Inline) {
														$$renderer.push('<!--[-->');

														Alert.Inline($$renderer, {
															status: 'warning',
															title: `You've reached your limit of ${currentPlan?.projects} projects`,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Extra projects are available on paid plans for an additional fee`);
															},

															$$slots: {
																default: true,
																actions: ($$renderer) => {
																	{
																		Button($$renderer, {
																			compact: true,
																			size: 's',
																			href: resolve('/(console)/organization-[organization]/billing', { organization: page.params.organization }),
																			external: true,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Upgrade`);
																			},
																			$$slots: { default: true }
																		});
																	}
																}
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
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

						$$renderer.push(` `);
						submit?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { projectName, id, region });
	});
}