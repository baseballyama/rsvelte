import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span><!></span> <!>`, 1);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<p class="text" data-private=""> </p>`);

export default function UpdateServices($$anchor, $$props) {
	$.push($$props, true);

	const $services = () => $.store_get(services, '$services', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isUpdatingAllServices = $.state(false);
	let showUpdateServiceDialog = $.state(false);
	let updateServicesEnabledMode = $.state(null);
	let apiServiceUpdates = new SvelteSet();
	const isAnyServiceUpdating = $.derived(() => apiServiceUpdates.size > 0);
	const isAnyUpdateInProgress = $.derived(() => $.get(isUpdatingAllServices) || $.get(isAnyServiceUpdating));

	const allServicesEnabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $services().list.every((service) => service.value);
	});

	const allServicesDisabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $services().list.every((service) => !service.value);
	});

	const shouldDisableEnableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allServicesEnabled));
	const shouldDisableDisableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allServicesDisabled));

	async function serviceUpdate(service) {
		apiServiceUpdates.add(service.method);

		try {
			await sdk.forProject($project().region, $project().$id).project.updateService({ serviceId: service.method, enabled: service.value });
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
		$.set(isUpdatingAllServices, true);

		try {
			const projectSdk = sdk.forProject($project().region, $project().$id);

			for (const s of get(services).list) {
				if (s.value === status) continue;

				await projectSdk.project.updateService({ serviceId: s.method, enabled: status });
			}

			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'All services for ' + $project().name + ' has been ' + (status ? 'enabled.' : 'disabled.')
			});

			trackEvent(Submit.ProjectService);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectService);
		} finally {
			$.set(isUpdatingAllServices, false);
			$.set(showUpdateServiceDialog, false);
			$.set(updateServicesEnabledMode, null);
		}
	}

	const dialogDetails = $.derived(() => {
		if ($.get(updateServicesEnabledMode)) {
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

	$.user_effect(() => services.load($project()));

	var fragment = root_2();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose services you wish to enable or disable for the client API. When disabled, the services are\n    not accessible to client SDKs but remain accessible to server SDKs.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Services');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						gap: 'm',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									direction: 'row',
									alignItems: 'center',
									gap: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => !$canWriteProjects() || $.get(shouldDisableEnableAllButton));

											Button(node_3, {
												extraCompact: true,
												get disabled() {
													return $.get($0);
												},

												$$events: {
													click: () => {
														if (!$canWriteProjects()) return;

														$.set(showUpdateServiceDialog, true);
														$.set(updateServicesEnabledMode, true);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Enable all');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										}

										var span = $.sibling(node_3, 2);

										$.set_style(span, '', {}, { height: '20px' });

										var node_4 = $.child(span);

										Divider(node_4, { vertical: true });
										$.reset(span);

										var node_5 = $.sibling(span, 2);

										{
											let $0 = $.derived(() => !$canWriteProjects() || $.get(shouldDisableDisableAllButton));

											Button(node_5, {
												extraCompact: true,
												get disabled() {
													return $.get($0);
												},

												$$events: {
													click: () => {
														if (!$canWriteProjects()) return;

														$.set(showUpdateServiceDialog, true);
														$.set(updateServicesEnabledMode, false);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Disable all');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									gap: 'l',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_7 = $.first_child(fragment_4);

										Divider(node_7, {});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
											Layout_Stack_3($$anchor, {
												direction: 'row',
												wrap: 'wrap',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_9 = $.first_child(fragment_5);

													$.each(node_9, 1, () => $services().list, $.index, ($$anchor, service, $$index) => {
														var span_1 = root_1();

														$.set_style(span_1, '', {}, { 'flex-basis': '30%' });

														var node_10 = $.child(span_1);

														$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
															Layout_Stack_4($$anchor, {
																direction: 'row',
																alignItems: 'center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_2();
																	var node_11 = $.first_child(fragment_6);

																	{
																		let $0 = $.derived(() => !$canWriteProjects() || apiServiceUpdates.has($.get(service).method));

																		InputSwitch(node_11, {
																			get id() {
																				return $.get(service).method;
																			},

																			get label() {
																				return $.get(service).label;
																			},

																			get disabled() {
																				return $.get($0);
																			},

																			get value() {
																				return $.get(service).value;
																			},

																			set value($$value) {
																				(
																					$.get(service).value = $$value,
																					$.invalidate_store($$stores, '$services')
																				);
																			},
																			$$events: { change: () => serviceUpdate($.get(service)) }
																		});
																	}

																	var node_12 = $.sibling(node_11, 2);

																	{
																		var consequent = ($$anchor) => {
																			var span_2 = root_1();

																			$.set_style(span_2, '', {}, { opacity: '0.75' });

																			var node_13 = $.child(span_2);

																			Spinner(node_13, { size: 's' });
																			$.reset(span_2);
																			$.append($$anchor, span_2);
																		};

																		var d = $.derived(() => apiServiceUpdates.has($.get(service).method));

																		$.if(node_12, ($$render) => {
																			if ($.get(d)) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														$.reset(span_1);
														$.append($$anchor, span_1);
													});

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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_14 = $.sibling(node, 2);

	Dialog(node_14, {
		get title() {
			return $.get(dialogDetails).title;
		},

		get open() {
			return $.get(showUpdateServiceDialog);
		},

		set open($$value) {
			$.set(showUpdateServiceDialog, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var p = root_3();
			var text_4 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_4, $.get(dialogDetails).message));
			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_15 = $.first_child(fragment_7);

				$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
					Layout_Stack_5($$anchor, {
						direction: 'row',
						gap: 's',
						justifyContent: 'flex-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_2();
							var node_16 = $.first_child(fragment_8);

							Button(node_16, {
								text: true,
								$$events: { click: () => $.set(showUpdateServiceDialog, false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Cancel');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							{
								let $0 = $.derived(() => !$canWriteProjects() || $.get(isUpdatingAllServices));

								Button(node_17, {
									secondary: true,
									submissionLoader: true,
									get disabled() {
										return $.get($0);
									},

									get forceShowLoader() {
										return $.get(isUpdatingAllServices);
									},

									$$events: {
										click: () => toggleAllServices($.get(updateServicesEnabledMode))
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(dialogDetails).actionButton));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}