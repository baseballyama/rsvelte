import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Field, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "$lib/registry/ui/item/index.js";

export default function Account_access($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Account Access`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Update your credentials or re-authenticate.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					FieldGroup($$renderer, {
						children: ($$renderer) => {
							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'email-address',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Email Address`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'email-address',
										type: 'email',
										placeholder: 'artist@studio.inc'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Field($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center justify-between">`);

									FieldLabel($$renderer, {
										for: 'current-password',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Current Password`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <a href="/" class="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground">Forgot?</a></div> `);

									Input($$renderer, {
										id: 'current-password',
										type: 'password',
										placeholder: '••••••••••••••••••••••••'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col gap-4',
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'LockKeyholeIcon',
								tabler: 'IconLock',
								hugeicons: 'SquareLock02Icon',
								phosphor: 'LockKeyIcon',
								remixicon: 'RiLockLine'
							});

							$$renderer.push(`<!----> Update Security`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						variant: 'muted',
						children: ($$renderer) => {
							ItemMedia($$renderer, {
								variant: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CircleAlertIcon',
										tabler: 'IconAlertCircle',
										hugeicons: 'AlertCircleIcon',
										phosphor: 'WarningCircleIcon',
										remixicon: 'RiErrorWarningLine',
										class: 'text-destructive'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ItemContent($$renderer, {
								children: ($$renderer) => {
									ItemTitle($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Danger Zone`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemDescription($$renderer, {
										class: 'line-clamp-1',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Archive account and remove catalog`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							IconPlaceholder($$renderer, {
								lucide: 'ArrowRightIcon',
								tabler: 'IconArrowRight',
								hugeicons: 'ArrowRight01Icon',
								phosphor: 'ArrowRightIcon',
								remixicon: 'RiArrowRightLine',
								class: 'size-4'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}