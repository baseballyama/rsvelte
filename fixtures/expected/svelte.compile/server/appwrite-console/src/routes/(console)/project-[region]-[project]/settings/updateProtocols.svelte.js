import * as $ from 'svelte/internal/server';
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

export default function UpdateProtocols($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isUpdatingAllProtocols = false;
		let showUpdateProtocolDialog = false;
		let updateProtocolsEnabledMode = null;
		let apiProtocolUpdates = new SvelteSet();

		const protocolDescriptions = {
			[ProjectProtocolId.Rest]: 'Standard HTTP API requests from client SDKs.',
			[ProjectProtocolId.Graphql]: 'GraphQL API access for queries and mutations.',
			[ProjectProtocolId.Websocket]: 'Realtime subscriptions over WebSocket connections.'
		};

		const isAnyProtocolUpdating = $.derived(() => apiProtocolUpdates.size > 0);
		const isAnyUpdateInProgress = $.derived(() => isUpdatingAllProtocols || isAnyProtocolUpdating());

		const allProtocolsEnabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$protocols', protocols).list.every((protocol) => protocol.value);
		});

		const allProtocolsDisabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$protocols', protocols).list.every((protocol) => !protocol.value);
		});

		const shouldDisableEnableAllButton = $.derived(() => isAnyUpdateInProgress() || allProtocolsEnabled());
		const shouldDisableDisableAllButton = $.derived(() => isAnyUpdateInProgress() || allProtocolsDisabled());

		async function protocolUpdate(protocol) {
			apiProtocolUpdates.add(protocol.method);

			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateProtocol({ protocolId: protocol.method, enabled: protocol.value });
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
			isUpdatingAllProtocols = true;

			try {
				const projectSdk = sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id);

				for (const protocol of get(protocols).list) {
					if (protocol.value === status) continue;

					await projectSdk.project.updateProtocol({ protocolId: protocol.method, enabled: status });
				}

				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'All protocols for ' + $.store_get($$store_subs ??= {}, '$project', project).name + ' have been ' + (status ? 'enabled.' : 'disabled.')
				});

				trackEvent(Submit.ProjectService);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.ProjectService);
			} finally {
				isUpdatingAllProtocols = false;
				showUpdateProtocolDialog = false;
				updateProtocolsEnabledMode = null;
			}
		}

		const dialogDetails = $.derived(() => {
			if (updateProtocolsEnabledMode) {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose which protocols clients can use to access your project. Disabled protocols remain unavailable
    until re-enabled.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Protocols`);
						}
					},

					aside: ($$renderer) => {
						{
							$$renderer.push(`<div class="protocols-list svelte-1un77eg"><div class="protocol-toolbar svelte-1un77eg">`);

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

							$$renderer.push(`</div> <div class="protocol-toolbar-divider">`);
							Divider($$renderer, {});
							$$renderer.push(`<!----></div> <div class="protocol-list-content svelte-1un77eg">`);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xs',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$protocols', protocols).list);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let protocol = each_array[index];

											$$renderer.push(`<div class="protocol-row svelte-1un77eg"><div class="protocol-control svelte-1un77eg">`);

											InputSwitch($$renderer, {
												id: protocol.method,
												label: protocol.label,
												description: protocolDescriptions[protocol.method],
												disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || apiProtocolUpdates.has(protocol.method),
												get value() {
													return protocol.value;
												},

												set value($$value) {
													protocol.value = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											if (apiProtocolUpdates.has(protocol.method)) {
												$$renderer.push(`<!--[0--><span class="protocol-spinner svelte-1un77eg">`);
												Spinner($$renderer, { size: 's' });
												$$renderer.push(`<!----></span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div></div> `);

											if (index < $.store_get($$store_subs ??= {}, '$protocols', protocols).list.length - 1) {
												$$renderer.push('<!--[0-->');
												Divider($$renderer, {});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
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

							$$renderer.push(`</div></div>`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Dialog($$renderer, {
				title: dialogDetails().title,
				get open() {
					return showUpdateProtocolDialog;
				},

				set open($$value) {
					showUpdateProtocolDialog = $$value;
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
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || isUpdatingAllProtocols,
											forceShowLoader: isUpdatingAllProtocols,
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