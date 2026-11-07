import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_checkboxes_icons($$renderer) {
	let notifications = { email: true, sms: false, push: true };

	Example($$renderer, {
		title: 'Checkboxes with Icons',
		children: ($$renderer) => {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline', class: 'w-fit' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Notifications`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'min-w-56',
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Notification Preferences`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													DropdownMenu.CheckboxItem($$renderer, {
														checked: notifications.email,
														onCheckedChange: (checked) => notifications = { ...notifications, email: checked === true },
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'MailIcon',
																tabler: 'IconMail',
																hugeicons: 'MailIcon',
																phosphor: 'EnvelopeIcon',
																remixicon: 'RiMailLine'
															});

															$$renderer.push(`<!----> Email notifications`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													DropdownMenu.CheckboxItem($$renderer, {
														checked: notifications.sms,
														onCheckedChange: (checked) => notifications = { ...notifications, sms: checked === true },
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'MessageSquareIcon',
																tabler: 'IconMessage',
																hugeicons: 'MessageIcon',
																phosphor: 'ChatCircleIcon',
																remixicon: 'RiChat1Line'
															});

															$$renderer.push(`<!----> SMS notifications`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													DropdownMenu.CheckboxItem($$renderer, {
														checked: notifications.push,
														onCheckedChange: (checked) => notifications = { ...notifications, push: checked === true },
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$$renderer.push(`<!----> Push notifications`);
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
}