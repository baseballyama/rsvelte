import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { protocols } from '$lib/stores/project-protocols';
import { sdk } from '$lib/stores/sdk';
import { project } from '../store';
import Button from '$lib/elements/forms/button.svelte';
import { Dialog, Divider, Layout, Spinner } from '@appwrite.io/pink-svelte';
import { SvelteSet } from 'svelte/reactivity';
import { ProjectProtocolId } from '@appwrite.io/console';
import { get } from 'svelte/store';
import { canWriteProjects } from '$lib/stores/roles';

var root = $.from_html(`<!> <span><!></span> <!>`, 1);
var root_1 = $.from_html(`<span class="protocol-spinner svelte-1un77eg"><!></span>`);
var root_2 = $.from_html(`<div class="protocol-row svelte-1un77eg"><div class="protocol-control svelte-1un77eg"><!> <!></div></div> <!>`, 1);
var root_3 = $.from_html(`<div class="protocols-list svelte-1un77eg"><div class="protocol-toolbar svelte-1un77eg"><!></div> <div class="protocol-toolbar-divider"><!></div> <div class="protocol-list-content svelte-1un77eg"><!></div></div>`);
var root_4 = $.from_html(`<p class="text" data-private=""> </p>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function UpdateProtocols($$anchor, $$props) {
	$.push($$props, true);

	const $protocols = () => $.store_get(protocols, '$protocols', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isUpdatingAllProtocols = $.state(false);
	let showUpdateProtocolDialog = $.state(false);
	let updateProtocolsEnabledMode = $.state(null);
	let apiProtocolUpdates = new SvelteSet();

	const protocolDescriptions = {
		[ProjectProtocolId.Rest]: 'Standard HTTP API requests from client SDKs.',
		[ProjectProtocolId.Graphql]: 'GraphQL API access for queries and mutations.',
		[ProjectProtocolId.Websocket]: 'Realtime subscriptions over WebSocket connections.'
	};

	const isAnyProtocolUpdating = $.derived(() => apiProtocolUpdates.size > 0);
	const isAnyUpdateInProgress = $.derived(() => $.get(isUpdatingAllProtocols) || $.get(isAnyProtocolUpdating));

	const allProtocolsEnabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $protocols().list.every((protocol) => protocol.value);
	});

	const allProtocolsDisabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $protocols().list.every((protocol) => !protocol.value);
	});

	const shouldDisableEnableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allProtocolsEnabled));
	const shouldDisableDisableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allProtocolsDisabled));

	async function protocolUpdate(protocol) {
		apiProtocolUpdates.add(protocol.method);

		try {
			await sdk.forProject($project().region, $project().$id).project.updateProtocol({ protocolId: protocol.method, enabled: protocol.value });
			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: `${protocol.label} protocol has been ${protocol.value ? 'enabled' : 'disabled'}`
			});

			trackEvent(Submit.ProjectService, { method: protocol.method, value: protocol.value });
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectService);
		} finally {
			apiProtocolUpdates.delete(protocol.method);
		}
	}

	async function toggleAllProtocols(status) {
		$.set(isUpdatingAllProtocols, true);

		try {
			const projectSdk = sdk.forProject($project().region, $project().$id);

			for (const protocol of get(protocols).list) {
				if (protocol.value === status) continue;

				await projectSdk.project.updateProtocol({ protocolId: protocol.method, enabled: status });
			}

			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'All protocols for ' + $project().name + ' have been ' + (status ? 'enabled.' : 'disabled.')
			});

			trackEvent(Submit.ProjectService);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectService);
		} finally {
			$.set(isUpdatingAllProtocols, false);
			$.set(showUpdateProtocolDialog, false);
			$.set(updateProtocolsEnabledMode, null);
		}
	}

	const dialogDetails = $.derived(() => {
		if ($.get(updateProtocolsEnabledMode)) {
			return {
				title: 'Enable all protocols',
				message: 'All project protocols will be enabled.',
				actionButton: 'Enable all'
			};
		} else {
			return {
				title: 'Disable all protocols',
				message: 'Are you sure you want to disable all protocols? This will disable client access over those protocols until they are re-enabled.',
				actionButton: 'Disable all'
			};
		}
	});

	$.user_effect(() => protocols.load($project()));

	var fragment = root_5();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose which protocols clients can use to access your project. Disabled protocols remain unavailable\n    until re-enabled.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Protocols');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var div = root_3();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						alignItems: 'center',
						gap: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							{
								let $0 = $.derived(() => !$canWriteProjects() || $.get(shouldDisableEnableAllButton));

								Button(node_2, {
									extraCompact: true,
									get disabled() {
										return $.get($0);
									},

									$$events: {
										click: () => {
											if (!$canWriteProjects()) return;

											$.set(showUpdateProtocolDialog, true);
											$.set(updateProtocolsEnabledMode, true);
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

							var span = $.sibling(node_2, 2);

							$.set_style(span, '', {}, { height: '20px' });

							var node_3 = $.child(span);

							Divider(node_3, { vertical: true });
							$.reset(span);

							var node_4 = $.sibling(span, 2);

							{
								let $0 = $.derived(() => !$canWriteProjects() || $.get(shouldDisableDisableAllButton));

								Button(node_4, {
									extraCompact: true,
									get disabled() {
										return $.get($0);
									},

									$$events: {
										click: () => {
											if (!$canWriteProjects()) return;

											$.set(showUpdateProtocolDialog, true);
											$.set(updateProtocolsEnabledMode, false);
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

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_5 = $.child(div_2);

				Divider(node_5, {});
				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_6 = $.child(div_3);

				$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						gap: 'xs',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_7 = $.first_child(fragment_2);

							$.each(node_7, 1, () => $protocols().list, $.index, ($$anchor, protocol, index) => {
								var fragment_3 = root_2();
								var div_4 = $.first_child(fragment_3);
								var div_5 = $.child(div_4);
								var node_8 = $.child(div_5);

								{
									let $0 = $.derived(() => !$canWriteProjects() || apiProtocolUpdates.has($.get(protocol).method));

									InputSwitch(node_8, {
										get id() {
											return $.get(protocol).method;
										},

										get label() {
											return $.get(protocol).label;
										},

										get description() {
											return protocolDescriptions[$.get(protocol).method];
										},

										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(protocol).value;
										},

										set value($$value) {
											(
												$.get(protocol).value = $$value,
												$.invalidate_store($$stores, '$protocols')
											);
										},
										$$events: { change: () => protocolUpdate($.get(protocol)) }
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									var consequent = ($$anchor) => {
										var span_1 = root_1();
										var node_10 = $.child(span_1);

										Spinner(node_10, { size: 's' });
										$.reset(span_1);
										$.append($$anchor, span_1);
									};

									var d = $.derived(() => apiProtocolUpdates.has($.get(protocol).method));

									$.if(node_9, ($$render) => {
										if ($.get(d)) $$render(consequent);
									});
								}

								$.reset(div_5);
								$.reset(div_4);

								var node_11 = $.sibling(div_4, 2);

								{
									var consequent_1 = ($$anchor) => {
										Divider($$anchor, {});
									};

									$.if(node_11, ($$render) => {
										if (index < $protocols().list.length - 1) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_12 = $.sibling(node, 2);

	Dialog(node_12, {
		get title() {
			return $.get(dialogDetails).title;
		},

		get open() {
			return $.get(showUpdateProtocolDialog);
		},

		set open($$value) {
			$.set(showUpdateProtocolDialog, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var p = root_4();
			var text_4 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_4, $.get(dialogDetails).message));
			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_13 = $.first_child(fragment_5);

				$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
					Layout_Stack_2($$anchor, {
						direction: 'row',
						gap: 's',
						justifyContent: 'flex-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_5();
							var node_14 = $.first_child(fragment_6);

							Button(node_14, {
								text: true,
								$$events: { click: () => $.set(showUpdateProtocolDialog, false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Cancel');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							{
								let $0 = $.derived(() => !$canWriteProjects() || $.get(isUpdatingAllProtocols));

								Button(node_15, {
									secondary: true,
									submissionLoader: true,
									get disabled() {
										return $.get($0);
									},

									get forceShowLoader() {
										return $.get(isUpdatingAllProtocols);
									},

									$$events: {
										click: () => toggleAllProtocols($.get(updateProtocolsEnabledMode))
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

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}