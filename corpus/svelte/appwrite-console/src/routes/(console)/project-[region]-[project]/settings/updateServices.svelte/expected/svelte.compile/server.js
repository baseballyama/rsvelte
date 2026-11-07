import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { services } from '$lib/stores/project-services';
import { sdk } from '$lib/stores/sdk';
import { project } from '../store';
import Button from '$lib/elements/forms/button.svelte';
import { Dialog, Divider, Layout, Spinner } from '@appwrite.io/pink-svelte';
import { get } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import { canWriteProjects } from '$lib/stores/roles';

export default function UpdateServices($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isUpdatingAllServices = false;
		let showUpdateServiceDialog = false;
		let updateServicesEnabledMode = null;
		let apiServiceUpdates = new SvelteSet();
		const isAnyServiceUpdating = $.derived(() => apiServiceUpdates.size > 0);
		const isAnyUpdateInProgress = $.derived(() => isUpdatingAllServices || isAnyServiceUpdating());

		const allServicesEnabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$services', services).list.every((service) => service.value);
		});

		const allServicesDisabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$services', services).list.every((service) => !service.value);
		});

		const shouldDisableEnableAllButton = $.derived(() => isAnyUpdateInProgress() || allServicesEnabled());
		const shouldDisableDisableAllButton = $.derived(() => isAnyUpdateInProgress() || allServicesDisabled());

		async function serviceUpdate(service) {
			apiServiceUpdates.add(service.method);

			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateService({ serviceId: service.method, enabled: service.value });
				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: `${service.label} service has been ${service.value ? 'enabled' : 'disabled'}`
				});

				trackEvent(Submit.ProjectService, { method: service.method, value: service.value });
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.ProjectService);
			} finally {
				apiServiceUpdates.delete(service.method);
			}
		}

		async function toggleAllServices(status) {
			isUpdatingAllServices = true;

			try {
				const projectSdk = sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id);

				for (const s of get(services).list) {
					if (s.value === status) continue;

					await projectSdk.project.updateService({ serviceId: s.method, enabled: status });
				}

				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'All services for ' + $.store_get($$store_subs ??= {}, '$project', project).name + ' has been ' + (status ? 'enabled.' : 'disabled.')
				});

				trackEvent(Submit.ProjectService);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.ProjectService);
			} finally {
				isUpdatingAllServices = false;
				showUpdateServiceDialog = false;
				updateServicesEnabledMode = null;
			}
		}

		const dialogDetails = $.derived(() => {
			if (updateServicesEnabledMode) {
				return {
					title: 'Enable all services',
					message: 'All project services will be enabled.',
					actionButton: 'Enable all'
				};
			} else {
				return {
					title: 'Disable all services',
					message: 'Are you sure you want to disable all services? This will disable API requests to this project for all Client SDKs.',
					actionButton: 'Disable all'
				};
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose services you wish to enable or disable for the client API. When disabled, the services are
    not accessible to client SDKs but remain accessible to server SDKs.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Services`);
						}
					},

					aside: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'm',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'center',
												gap: 's',
												children: ($$renderer) => {
													Button($$renderer, {
														extraCompact: true,
														disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || shouldDisableEnableAllButton(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Enable all`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> <span${$.attr_style('', { height: '20px' })}>`);
													Divider($$renderer, { vertical: true });
													$$renderer.push(`<!----></span> `);

													Button($$renderer, {
														extraCompact: true,
														disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || shouldDisableDisableAllButton(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Disable all`);
														},
														$$slots: { default: true }
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

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'l',
												children: ($$renderer) => {
													Divider($$renderer, {});
													$$renderer.push(`<!----> `);

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															wrap: 'wrap',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$services', services).list);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let service = each_array[$$index];

																	$$renderer.push(`<span${$.attr_style('', { 'flex-basis': '30%' })}>`);

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			children: ($$renderer) => {
																				InputSwitch($$renderer, {
																					id: service.method,
																					label: service.label,
																					disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || apiServiceUpdates.has(service.method),
																					get value() {
																						return service.value;
																					},

																					set value($$value) {
																						service.value = $$value;
																						$$settled = false;
																					}
																				});

																				$$renderer.push(`<!----> `);

																				if (apiServiceUpdates.has(service.method)) {
																					$$renderer.push(`<!--[0--><span${$.attr_style('', { opacity: '0.75' })}>`);
																					Spinner($$renderer, { size: 's' });
																					$$renderer.push(`<!----></span>`);
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

																	$$renderer.push(`</span>`);
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

			$$renderer.push(`<!----> `);

			Dialog($$renderer, {
				title: dialogDetails().title,
				get open() {
					return showUpdateServiceDialog;
				},

				set open($$value) {
					showUpdateServiceDialog = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<p class="text" data-private="">${$.escape(dialogDetails().message)}</p>`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									justifyContent: 'flex-end',
									children: ($$renderer) => {
										Button($$renderer, {
											text: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											secondary: true,
											submissionLoader: true,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || isUpdatingAllServices,
											forceShowLoader: isUpdatingAllServices,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(dialogDetails().actionButton)}`);
											},
											$$slots: { default: true }
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
						}
					}
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}