import * as $ from 'svelte/internal/server';
import Delete from './delete.svelte';
import Web from './web.svelte';
import AppleiOs from './appleIOS.svelte';
import Android from './android.svelte';
import FlutterLinux from './flutterLinux.svelte';
import FlutterWindows from './flutterWindows.svelte';
import { Box, CardGrid } from '$lib/components';
import { Button, Form, InputText } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { project } from '../../../store';
import { platform } from './store';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { getPlatformIdentifier } from '$lib/helpers/platform';

export default function _page_project__region___project_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const types = {
			web: Web,
			android: Android,
			apple: AppleiOs,
			windows: FlutterWindows,
			linux: FlutterLinux
		};

		let showDelete = false;
		let name = null;

		onMount(() => {
			name ??= $.store_get($$store_subs ??= {}, '$platform', platform).name;
		});

		async function updateName() {
			try {
				const projectSdk = sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project;
				const platformId = $.store_get($$store_subs ??= {}, '$platform', platform).$id;

				switch ($.store_get($$store_subs ??= {}, '$platform', platform).type) {
					case 'web':
						await projectSdk.updateWebPlatform({
							platformId,
							name,
							hostname: $.store_get($$store_subs ??= {}, '$platform', platform).hostname || undefined
						});
						break;

					case 'android':
						await projectSdk.updateAndroidPlatform({
							platformId,
							name,
							applicationId: $.store_get($$store_subs ??= {}, '$platform', platform).applicationId
						});
						break;

					case 'apple':
						await projectSdk.updateApplePlatform({
							platformId,
							name,
							bundleIdentifier: $.store_get($$store_subs ??= {}, '$platform', platform).bundleIdentifier
						});
						break;

					case 'windows':
						await projectSdk.updateWindowsPlatform({
							platformId,
							name,
							packageIdentifierName: $.store_get($$store_subs ??= {}, '$platform', platform).packageIdentifierName
						});
						break;

					case 'linux':
						await projectSdk.updateLinuxPlatform({
							platformId,
							name,
							packageName: $.store_get($$store_subs ??= {}, '$platform', platform).packageName
						});
						break;

					default:
						throw new Error(`Unknown platform type: ${$.store_get($$store_subs ??= {}, '$platform', platform).type}`);
				}

				await invalidate(Dependencies.PLATFORM);
				addNotification({ type: 'success', message: 'Platform name has been updated' });
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: updateName,
						children: ($$renderer) => {
							CardGrid($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Choose any name that will help you distinguish between platforms.`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`Name`);
										}
									},

									aside: ($$renderer) => {
										{
											InputText($$renderer, {
												id: 'name',
												label: 'Name',
												required: true,
												placeholder: 'Enter name',
												get value() {
													return name;
												},

												set value($$value) {
													name = $$value;
													$$settled = false;
												}
											});
										}
									},

									actions: ($$renderer) => {
										{
											Button($$renderer, {
												disabled: name === $.store_get($$store_subs ??= {}, '$platform', platform).name,
												submit: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Update`);
												},
												$$slots: { default: true }
											});
										}
									}
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (types[$.store_get($$store_subs ??= {}, '$platform', platform).type]) {
						$$renderer.push('<!--[-->');
						types[$.store_get($$store_subs ??= {}, '$platform', platform).type]($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The Platform will be permanently deleted. This action is irreversible.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Delete platform`);
								}
							},

							aside: ($$renderer) => {
								{
									Box($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="u-flex u-gap-16"><div class="u-cross-child-center u-line-height-1-5"><h6 class="u-bold">${$.escape($.store_get($$store_subs ??= {}, '$platform', platform).name)}</h6> <p>${$.escape(getPlatformIdentifier($.store_get($$store_subs ??= {}, '$platform', platform)))}</p></div></div>`);
										},
										$$slots: { default: true }
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										secondary: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Delete`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Delete($$renderer, {
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
					$$settled = false;
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