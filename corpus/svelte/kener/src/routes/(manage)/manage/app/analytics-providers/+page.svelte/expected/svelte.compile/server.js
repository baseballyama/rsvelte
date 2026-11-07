import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import Loader from "@lucide/svelte/icons/loader";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		// State
		let loading = true;

		let saving = false;
		let selectedAnalytics = null;

		// Analytics providers configuration
		let analyticsProviders = [
			{
				label: "Google Analytics",
				logo: "/ga.png",
				key: "analytics.googleTagManager",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Measurement ID",
						type: "text",
						placeholder: "G-S05E5E5E5E5",
						required: true,
						value: ""
					},

					{
						label: "Transport URL",
						type: "text",
						placeholder: "https://www.google-analytics.com",
						required: false,
						value: ""
					},

					{
						label: "Script Host",
						type: "text",
						placeholder: "https://www.googletagmanager.com",
						required: false,
						value: ""
					}
				]
			},

			{
				label: "Plausible",
				logo: "/plausible.png",
				key: "analytics.plausible",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Domain",
						type: "text",
						placeholder: "kener.ing",
						required: true,
						value: ""
					},

					{
						label: "API",
						type: "text",
						placeholder: "https://plausible.io/api/event",
						required: true,
						value: "https://plausible.io/api/event"
					},

					{
						label: "Script Source",
						type: "text",
						placeholder: "https://plausible.io/js/script.pageview-props.tagged-events.js",
						required: true,
						value: "https://plausible.io/js/script.pageview-props.tagged-events.js"
					}
				]
			},

			{
				label: "MixPanel",
				logo: "/mx.png",
				key: "analytics.mixpanel",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Project Token",
						type: "text",
						placeholder: "YOUR_PROJECT_TOKEN",
						required: true,
						value: ""
					},

					{
						label: "API Host",
						type: "text",
						placeholder: "https://api.mixpanel.com",
						required: false,
						value: ""
					}
				]
			},

			{
				label: "Amplitude",
				logo: "/amplitude.png",
				key: "analytics.amplitude",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Amplitude API Key",
						type: "text",
						placeholder: "API key for your Amplitude project",
						required: true,
						value: ""
					},

					{
						label: "Server URL",
						type: "text",
						placeholder: "https://api2.amplitude.com/2/httpapi",
						required: false,
						value: ""
					}
				]
			},

			{
				label: "Microsoft Clarity",
				logo: "/clarity.png",
				key: "analytics.clarity",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Project ID",
						type: "text",
						placeholder: "Project ID for your Microsoft Clarity project",
						required: true,
						value: ""
					}
				]
			},

			{
				label: "Umami",
				logo: "/umami.png",
				key: "analytics.umami",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "Website ID",
						type: "text",
						placeholder: "Website ID for your umami script and domain",
						required: true,
						value: ""
					},

					{
						label: "Script URL",
						type: "text",
						placeholder: "https://cloud.umami.is/script.js",
						required: true,
						value: "https://cloud.umami.is/script.js"
					}
				]
			},

			{
				label: "PostHog",
				logo: "/posthog.png",
				key: "analytics.posthog",
				isEnabled: false,
				activeInSite: false,
				requirements: [
					{
						label: "API Key",
						type: "text",
						placeholder: "phc_xxxxxxxxxxxxxxxxxxxx",
						required: true,
						value: ""
					},

					{
						label: "API Host",
						type: "text",
						placeholder: "https://us.i.posthog.com",
						required: true,
						value: "https://us.i.posthog.com"
					}
				]
			}
		];

		async function fetchAnalyticsData() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getAllSiteData" })
				});

				const result = await response.json();

				if (!result.error) {
					// Update providers with saved data
					analyticsProviders = analyticsProviders.map((provider) => {
						const dbData = result[provider.key];

						if (dbData) {
							provider.isEnabled = dbData.isEnabled || false;
							provider.activeInSite = dbData.isEnabled || false;

							if (dbData.requirements) {
								provider.requirements = provider.requirements.map((req) => ({ ...req, value: dbData.requirements[req.label] || req.value }));
							}
						}

						return provider;
					});
				}

				// Select the first provider by default
				selectedAnalytics = analyticsProviders[0];
			} catch(e) {
				toast.error("Failed to load analytics settings");
			} finally {
				loading = false;
			}
		}

		async function saveAnalytics() {
			if (!selectedAnalytics) return;

			saving = true;

			try {
				// Build requirements data
				const requirementsData = {};

				selectedAnalytics.requirements.forEach((req) => {
					requirementsData[req.label] = req.value;
				});

				// Build final data object
				const dataToSave = {};

				dataToSave[selectedAnalytics.key] = JSON.stringify({
					requirements: requirementsData,
					isEnabled: selectedAnalytics.isEnabled
				});

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: dataToSave })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success(`${selectedAnalytics.label} settings saved successfully`);

					// Update activeInSite status
					selectedAnalytics.activeInSite = selectedAnalytics.isEnabled;

					// Update in the providers list
					const index = analyticsProviders.findIndex((p) => p.key === selectedAnalytics.key);

					if (index !== -1) {
						analyticsProviders[index].activeInSite = selectedAnalytics.isEnabled;
					}
				}
			} catch(e) {
				toast.error("Failed to save analytics settings");
			} finally {
				saving = false;
			}
		}

		function selectProvider(provider) {
			selectedAnalytics = provider;
		}

		onMount(() => {
			fetchAnalyticsData();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 px-4"><div>Add your analytics ID/Key here. You can add multiple analytics providers. <a href="https://kener.ing/docs/v4/analytics" target="_blank" rel="noopener noreferrer" class="text-primary ml-1 underline underline-offset-2">Learn more</a>.</div> `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
				Spinner($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="grid grid-cols-4 overflow-hidden rounded-md border"><div class="col-span-1 flex flex-col border-r"><!--[-->`);

				const each_array = $.ensure_array_like(analyticsProviders);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let provider = each_array[$$index];

					Button($$renderer, {
						variant: selectedAnalytics?.key === provider.key ? "secondary" : "ghost",
						class: 'flex items-center justify-between gap-x-2 rounded-none border-b text-sm last:border-none',
						onclick: () => selectProvider(provider),
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-row items-center gap-x-3"><img${$.attr('src', clientResolver(resolve, provider.logo))} class="w-5"${$.attr('alt', provider.label)}/> <span>${$.escape(provider.label)}</span></div> `);

							if (provider.activeInSite && provider.isEnabled) {
								$$renderer.push(`<!--[0--><div class="rounded-sm"><span class="relative flex size-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex size-2 rounded-full bg-green-500"></span></span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div> <form class="col-span-3 flex flex-col justify-between p-4">`);

				if (selectedAnalytics) {
					$$renderer.push(`<!--[0--><div><div class="text-muted-foreground mb-4 text-sm font-medium">Add details for your ${$.escape(selectedAnalytics.label)} account</div> <div class="grid grid-cols-2 gap-4"><!--[-->`);

					const each_array_1 = $.ensure_array_like(selectedAnalytics.requirements);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let req = each_array_1[$$index_1];

						$$renderer.push(`<div class="flex flex-col gap-y-2">`);

						Label($$renderer, {
							for: req.label,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(req.label)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							type: req.type,
							id: req.label,
							placeholder: req.placeholder,
							required: req.required,
							get value() {
								return req.value;
							},

							set value($$value) {
								req.value = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Status`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							value: selectedAnalytics.isEnabled ? "enabled" : "disabled",
							onValueChange: (value) => {
								if (!value || !selectedAnalytics) return;

								selectedAnalytics.isEnabled = value === "enabled";
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-32',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(selectedAnalytics.isEnabled ? "Enable" : "Disable")}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'enabled',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Enable`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'disabled',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Disable`);
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

					$$renderer.push(`</div></div> <div class="mt-4 flex flex-row items-center justify-between">`);

					Button($$renderer, {
						type: 'submit',
						disabled: saving,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Save Changes for ${$.escape(selectedAnalytics.label)} `);

							if (saving) {
								$$renderer.push('<!--[0-->');
								Loader($$renderer, { class: 'ml-2 inline size-4 animate-spin' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></form></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}