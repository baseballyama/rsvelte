import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="u-flex u-gap-16"><div class="u-cross-child-center u-line-height-1-5"><h6 class="u-bold"> </h6> <p> </p></div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page_project__region___project_($$anchor, $$props) {
	$.push($$props, true);

	const $platform = () => $.store_get(platform, '$platform', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
		name ??= $platform().name;
	});

	async function updateName() {
		try {
			const projectSdk = sdk.forProject($project().region, $project().$id).project;
			const platformId = $platform().$id;

			switch ($platform().type) {
				case 'web':
					await projectSdk.updateWebPlatform({
						platformId,
						name,
						hostname: $platform().hostname || undefined
					});
					break;

				case 'android':
					await projectSdk.updateAndroidPlatform({ platformId, name, applicationId: $platform().applicationId });
					break;

				case 'apple':
					await projectSdk.updateApplePlatform({
						platformId,
						name,
						bundleIdentifier: $platform().bundleIdentifier
					});
					break;

				case 'windows':
					await projectSdk.updateWindowsPlatform({
						platformId,
						name,
						packageIdentifierName: $platform().packageIdentifierName
					});
					break;

				case 'linux':
					await projectSdk.updateLinuxPlatform({ platformId, name, packageName: $platform().packageName });
					break;

				default:
					throw new Error(`Unknown platform type: ${$platform().type}`);
			}

			await invalidate(Dependencies.PLATFORM);
			addNotification({ type: 'success', message: 'Platform name has been updated' });
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Form(node_1, {
				onSubmit: updateName,
				children: ($$anchor, $$slotProps) => {
					CardGrid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Choose any name that will help you distinguish between platforms.');

							$.append($$anchor, text);
						},

						$$slots: {
							default: true,
							title: ($$anchor, $$slotProps) => {
								var text_1 = $.text('Name');

								$.append($$anchor, text_1);
							},

							aside: ($$anchor, $$slotProps) => {
								InputText($$anchor, {
									id: 'name',
									label: 'Name',
									required: true,
									placeholder: 'Enter name',
									get value() {
										return name;
									},

									set value($$value) {
										name = $$value;
									}
								});
							},

							actions: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => name === $platform().name);

									Button($$anchor, {
										get disabled() {
											return $.get($0);
										},
										submit: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Update');

											$.append($$anchor, text_2);
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

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => types[$platform().type], ($$anchor, $$component) => {
				$$component($$anchor, {});
			});

			var node_3 = $.sibling(node_2, 2);

			CardGrid(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('The Platform will be permanently deleted. This action is irreversible.');

					$.append($$anchor, text_3);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_4 = $.text('Delete platform');

						$.append($$anchor, text_4);
					},

					aside: ($$anchor, $$slotProps) => {
						Box($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var div = root();
								var div_1 = $.child(div);
								var h6 = $.child(div_1);
								var text_5 = $.only_child(h6, true);
								var p = $.sibling(h6, 2);
								var text_6 = $.only_child(p, true);

								$.reset(div_1);
								$.reset(div);

								$.template_effect(
									($0) => {
										$.set_text(text_5, $platform().name);
										$.set_text(text_6, $0);
									},
									[() => getPlatformIdentifier($platform())]
								);

								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					},

					actions: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							secondary: true,
							$$events: { click: () => showDelete = true },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Delete');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Delete(node_4, {
		get showDelete() {
			return showDelete;
		},

		set showDelete($$value) {
			showDelete = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}