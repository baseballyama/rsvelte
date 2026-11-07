import * as $ from 'svelte/internal/server';
import { Button, InputText } from '$lib/elements/forms';
import { getBasePlanFromGroup, getServiceLimit } from '$lib/stores/billing';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Badge, Icon, Layout, Table, Typography, Tooltip } from '@appwrite.io/pink-svelte';
import { IconArrowUp, IconInfo } from '@appwrite.io/pink-icons-svelte';
import { formatNumberWithCommas } from '$lib/helpers/numbers';
import { Modal } from '$lib/components';
import { Alert } from '@appwrite.io/pink-svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { BillingPlanGroup } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

export default function OrganizationUsageLimits($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { members = [], storageUsage = 0, projects = [] } = $$props;
		let showSelectProject = false;
		let error = null;
		let showSelectionReminder = false;
		let confirmationInput = '';
		let isDeletingProjects = false;
		let selectedProjectsToDelete = [];
		const baseFreePlan = getBasePlanFromGroup(BillingPlanGroup.Starter);

		// Derived state using runes
		const freePlanLimits = $.derived(() => ({
			projects: baseFreePlan?.projects,
			members: getServiceLimit('members', null, baseFreePlan),
			storage: getServiceLimit('storage', null, baseFreePlan)
		}));

		// When preparing to downgrade to Free, enforce Free plan limit locally (2)
		const allowedProjectsToKeep = $.derived(() => freePlanLimits().projects);

		const currentUsage = $.derived(() => ({
			projects: projects?.length || 0,
			members: members?.length || 0,
			storage: storageUsage || 0
		}));

		const storageUsageGB = $.derived(() => storageUsage / (1024 * 1024 * 1024));

		const isLimitExceeded = $.derived(() => ({
			projects: currentUsage().projects > freePlanLimits().projects,
			members: currentUsage().members > freePlanLimits().members,
			storage: storageUsageGB() > freePlanLimits().storage
		}));

		const excessUsage = $.derived(() => ({
			projects: Math.max(0, currentUsage().projects),
			members: Math.max(0, currentUsage().members - freePlanLimits().members),
			storage: Math.max(0, storageUsageGB() - freePlanLimits().storage)
		}));

		const isConfirmationValid = $.derived(() => confirmationInput.trim() === 'I understand');

		function formatNumber(num) {
			return formatNumberWithCommas(num);
		}

		function handleManageProjects() {
			showSelectProject = true;
			showSelectionReminder = false;
			trackEvent(Click.OrganizationClickUpgrade, { source: 'usage_limits_manage_projects' });
		}

		async function deleteSelected() {
			error = null;
			isDeletingProjects = true;

			const excessBy = isLimitExceeded().projects ? projects.length - allowedProjectsToKeep() : 0;
			const isUnderLimitPostSelection = selectedProjectsToDelete.length >= excessBy;

			if (!isUnderLimitPostSelection) {
				error = `You can keep a maximum ${allowedProjectsToKeep()} projects on the selected plan.`;

				return;
			}

			if (selectedProjectsToDelete?.length) {
				const projectsDeletionPromises = selectedProjectsToDelete.map((projectId) => {
					const projectToDelete = projects.find((project) => project.$id === projectId);

					return {
						projectId,
						promise: sdk.forProject(projectToDelete.region, projectId).project.delete()
					};
				});

				try {
					const results = await Promise.allSettled(projectsDeletionPromises.map((p) => p.promise));
					const failed = [];
					const successfullyDeleted = [];

					results.forEach((result, index) => {
						const projectId = projectsDeletionPromises[index].projectId;

						if (result.status === 'fulfilled') {
							successfullyDeleted.push(projectId);
						} else {
							failed.push(projectId);
						}
					});

					if (successfullyDeleted.length > 0) {
						await invalidate(Dependencies.ORGANIZATION);

						addNotification({
							type: 'success',
							message: `${successfullyDeleted.length} project${successfullyDeleted.length !== 1 ? 's' : ''} deleted successfully`
						});
					}

					if (failed.length > 0) {
						error = `Failed to delete ${failed.length} project${failed.length !== 1 ? 's' : ''}`;
					} else {
						confirmationInput = '';
						showSelectProject = false;
						selectedProjectsToDelete = [];
						showSelectionReminder = false;

						if (successfullyDeleted.length > 0) {
							projects = projects.filter((p) => !successfullyDeleted.includes(p.$id));
						}
					}
				} catch(exception) {
					error = exception.message;
				} finally {
					isDeletingProjects = false;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'l',
					children: ($$renderer) => {
						if (showSelectionReminder) {
							$$renderer.push('<!--[0-->');

							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									status: 'warning',
									title: 'Choose projects to keep',
									children: ($$renderer) => {
										$$renderer.push(`<!---->The Free plan lets you keep ${$.escape(allowedProjectsToKeep())} projects. Select them before continuing. `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												justifyContent: 'flex-start',
												gap: 'xs',
												style: 'position: relative; z-index: 10; pointer-events: auto;',
												children: ($$renderer) => {
													Button($$renderer, {
														compact: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Manage projects`);
														},
														$$slots: { default: true }
													});
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

						$$renderer.push(`<!--]--> <div class="responsive-table svelte-15t2ozq">`);

						if (Table.Root) {
							$$renderer.push('<!--[-->');

							Table.Root($$renderer, {
								columns: [
									{ id: 'resource', width: { min: 215 } },
									{ id: 'freeLimit', width: { min: 100 } },
									{ id: 'excessUsage', width: { min: 120 } },
									{ id: 'manage', width: { min: 110 } }
								],
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { root }) => {
										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'resource',
															root,
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 'xs',
																		children: ($$renderer) => {
																			if (Typography.Text) {
																				$$renderer.push('<!--[-->');

																				Typography.Text($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Projects`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (isLimitExceeded().projects) {
																				$$renderer.push('<!--[0-->');

																				Badge($$renderer, {
																					size: 'xs',
																					content: 'Action required',
																					variant: 'secondary',
																					type: 'warning'
																				});
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'freeLimit',
															root,
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(formatNumber(allowedProjectsToKeep()))} projects`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'excessUsage',
															root,
															children: ($$renderer) => {
																if (isLimitExceeded().projects) {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			gap: 'xs',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconArrowUp, size: 's', color: '--fgcolor-error' });
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						color: '--fgcolor-error',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(formatNumber(excessUsage().projects))} projects`);
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

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			color: '--fgcolor-neutral-secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatNumber(currentUsage().projects))} / ${$.escape(formatNumber(allowedProjectsToKeep()))}`);
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'manage',
															root,
															children: ($$renderer) => {
																if (isLimitExceeded().projects) {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			justifyContent: 'flex-end',
																			children: ($$renderer) => {
																				Button($$renderer, {
																					size: 'xs',
																					secondary: true,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Manage projects`);
																					},
																					$$slots: { default: true }
																				});
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

										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'resource',
															root,
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Organization members`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'freeLimit',
															root,
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(formatNumber(freePlanLimits().members))} member`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'excessUsage',
															root,
															children: ($$renderer) => {
																if (isLimitExceeded().members) {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			gap: 'xs',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconArrowUp, size: 's', color: '--fgcolor-error' });
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						color: '--fgcolor-error',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(formatNumber(excessUsage().members))} members`);
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

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			color: '--fgcolor-neutral-secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->N/A`);
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');
														Table.Cell($$renderer, { column: 'manage', root });
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

										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'resource',
															root,
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Storage`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'freeLimit',
															root,
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(freePlanLimits().storage)} GB`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'excessUsage',
															root,
															children: ($$renderer) => {
																if (isLimitExceeded().storage) {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			gap: 'xs',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconArrowUp, size: 's', color: '--fgcolor-error' });
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						color: '--fgcolor-error',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(excessUsage().storage.toFixed(2))} GB`);
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

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			color: '--fgcolor-neutral-secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(storageUsageGB().toFixed(2))} / ${$.escape(freePlanLimits().storage)} GB`);
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');
														Table.Cell($$renderer, { column: 'manage', root });
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

									header: ($$renderer, { root }) => {
										{
											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');

												Table.Header.Cell($$renderer, {
													column: 'resource',
													root,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Resource`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');

												Table.Header.Cell($$renderer, {
													column: 'freeLimit',
													root,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Free limit`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');

												Table.Header.Cell($$renderer, {
													column: 'excessUsage',
													root,
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																alignItems: 'center',
																gap: 'xs',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Excess usage`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	Tooltip($$renderer, {
																		placement: 'bottom',
																		portal: true,
																		children: ($$renderer) => {
																			Icon($$renderer, { icon: IconInfo, size: 's' });
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$renderer) => {
																				$$renderer.push(`<span slot="tooltip">Usage beyond the Free plan limits.</span>`);
																			}
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
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');
												Table.Header.Cell($$renderer, { column: 'manage', root });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
									}
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (showSelectProject) {
				$$renderer.push('<!--[0-->');

				const requiredToDelete = currentUsage().projects - allowedProjectsToKeep();

				Modal($$renderer, {
					title: 'Delete projects to downgrade',
					onSubmit: deleteSelected,
					dismissible: false,
					get show() {
						return showSelectProject;
					},

					set show($$value) {
						showSelectProject = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (error) {
							$$renderer.push('<!--[0-->');

							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									status: 'error',
									title: 'Error',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(error)}`);
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

							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									status: 'warning',
									title: 'The selected projects will be permanently deleted',
									children: ($$renderer) => {
										$$renderer.push(`<!---->The selected projects and all associated data will be permanently deleted and cannot
                be recovered.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'm',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 's',
											direction: 'row',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Select ${$.escape(requiredToDelete)} project${$.escape(requiredToDelete !== 1 ? 's' : '')} to delete`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												Badge($$renderer, {
													size: 'xs',
													variant: 'secondary',
													content: `${selectedProjectsToDelete.length} selected`
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

									$$renderer.push(` <div class="controlled-selection svelte-15t2ozq">`);

									if (Table.Root) {
										$$renderer.push('<!--[-->');

										Table.Root($$renderer, {
											allowSelection: true,
											columns: [{ id: 'name' }, { id: 'created' }],
											get selectedRows() {
												return selectedProjectsToDelete;
											},

											set selectedRows($$value) {
												selectedProjectsToDelete = $$value;
												$$settled = false;
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$renderer, { root }) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(projects);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let project = each_array[$$index];
														const isRowSelected = selectedProjectsToDelete.includes(project.$id);
														const shouldDisable = !isRowSelected && selectedProjectsToDelete.length >= requiredToDelete;

														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																id: project.$id,
																select: shouldDisable ? 'disabled' : undefined,
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'name',
																			root,
																			children: ($$renderer) => {
																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						truncate: true,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(project.name)}`);
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

																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'created',
																			root,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(toLocaleDateTime(project.$createdAt))}`);
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
													}

													$$renderer.push(`<!--]-->`);
												},

												header: ($$renderer, { root }) => {
													{
														if (Table.Header.Cell) {
															$$renderer.push('<!--[-->');

															Table.Header.Cell($$renderer, {
																column: 'name',
																root,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Project Name`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Table.Header.Cell) {
															$$renderer.push('<!--[-->');

															Table.Header.Cell($$renderer, {
																column: 'created',
																root,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Created`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}
												}
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (selectedProjectsToDelete.length >= requiredToDelete) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xs',
									children: ($$renderer) => {
										InputText($$renderer, {
											required: true,
											id: 'confirmation',
											placeholder: 'I understand',
											disabled: isDeletingProjects,
											label: `Type "I understand" to confirm permanent deletion of the selected projects`,
											get value() {
												return confirmationInput;
											},

											set value($$value) {
												confirmationInput = $$value;
												$$settled = false;
											}
										});
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

						$$renderer.push(`<!--]-->`);
					},

					$$slots: {
						default: true,
						description: ($$renderer) => {
							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									slot: 'description',
									children: ($$renderer) => {
										$$renderer.push(`<!---->The Free plan lets you keep ${$.escape(allowedProjectsToKeep())} projects. Select projects you want to
            permanently delete.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},

						footer: ($$renderer) => {
							{
								Button($$renderer, {
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									submit: true,
									danger: true,
									submissionLoader: true,
									forceShowLoader: isDeletingProjects,
									disabled: selectedProjectsToDelete.length < requiredToDelete || !isConfirmationValid(),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Delete projects`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { projects });
	});
}