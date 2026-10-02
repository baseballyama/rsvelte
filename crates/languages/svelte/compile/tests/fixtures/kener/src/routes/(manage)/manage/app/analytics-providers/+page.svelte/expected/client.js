import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_1 = $.from_html(`<div class="rounded-sm"><span class="relative flex size-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex size-2 rounded-full bg-green-500"></span></span></div>`);
var root_2 = $.from_html(`<div class="flex flex-row items-center gap-x-3"><img class="w-5"/> <span> </span></div> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-y-2"><!> <!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(` <!>`, 1);
var root_6 = $.from_html(`<div><div class="text-muted-foreground mb-4 text-sm font-medium"> </div> <div class="grid grid-cols-2 gap-4"><!> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="mt-4 flex flex-row items-center justify-between"><!></div></div>`);
var root_7 = $.from_html(`<div class="grid grid-cols-4 overflow-hidden rounded-md border"><div class="col-span-1 flex flex-col border-r"></div> <form class="col-span-3 flex flex-col justify-between p-4"><!></form></div>`);
var root_8 = $.from_html(`<div class="flex w-full flex-col gap-4 px-4"><div>Add your analytics ID/Key here. You can add multiple analytics providers. <a href="https://kener.ing/docs/v4/analytics" target="_blank" rel="noopener noreferrer" class="text-primary ml-1 underline underline-offset-2">Learn more</a>.</div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Types
	// State
	let loading = $.state(true);

	let saving = $.state(false);
	let selectedAnalytics = $.state(null);

	// Analytics providers configuration
	let analyticsProviders = $.state($.proxy([
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
	]));

	async function fetchAnalyticsData() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getAllSiteData" })
			});

			const result = await response.json();

			if (!result.error) {
				// Update providers with saved data
				$.set(
					analyticsProviders,
					$.get(analyticsProviders).map((provider) => {
						const dbData = result[provider.key];

						if (dbData) {
							provider.isEnabled = dbData.isEnabled || false;
							provider.activeInSite = dbData.isEnabled || false;

							if (dbData.requirements) {
								provider.requirements = provider.requirements.map((req) => ({ ...req, value: dbData.requirements[req.label] || req.value }));
							}
						}

						return provider;
					}),
					true
				);
			}

			// Select the first provider by default
			$.set(selectedAnalytics, $.get(analyticsProviders)[0], true);
		} catch(e) {
			toast.error("Failed to load analytics settings");
		} finally {
			$.set(loading, false);
		}
	}

	async function saveAnalytics() {
		if (!$.get(selectedAnalytics)) return;

		$.set(saving, true);

		try {
			// Build requirements data
			const requirementsData = {};

			$.get(selectedAnalytics).requirements.forEach((req) => {
				requirementsData[req.label] = req.value;
			});

			// Build final data object
			const dataToSave = {};

			dataToSave[$.get(selectedAnalytics).key] = JSON.stringify({
				requirements: requirementsData,
				isEnabled: $.get(selectedAnalytics).isEnabled
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
				toast.success(`${$.get(selectedAnalytics).label} settings saved successfully`);

				// Update activeInSite status
				$.get(selectedAnalytics).activeInSite = $.get(selectedAnalytics).isEnabled;

				// Update in the providers list
				const index = $.get(analyticsProviders).findIndex((p) => p.key === $.get(selectedAnalytics).key);

				if (index !== -1) {
					$.get(analyticsProviders)[index].activeInSite = $.get(selectedAnalytics).isEnabled;
				}
			}
		} catch(e) {
			toast.error("Failed to save analytics settings");
		} finally {
			$.set(saving, false);
		}
	}

	function selectProvider(provider) {
		$.set(selectedAnalytics, provider, true);
	}

	onMount(() => {
		fetchAnalyticsData();
	});

	var div = root_8();
	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_7();
			var div_3 = $.child(div_2);

			$.each(div_3, 21, () => $.get(analyticsProviders), (provider) => provider.key, ($$anchor, provider) => {
				{
					let $0 = $.derived(() => $.get(selectedAnalytics)?.key === $.get(provider).key ? "secondary" : "ghost");

					Button($$anchor, {
						get variant() {
							return $.get($0);
						},
						class: 'flex items-center justify-between gap-x-2 rounded-none border-b text-sm last:border-none',
						onclick: () => selectProvider($.get(provider)),
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var div_4 = $.first_child(fragment_1);
							var img = $.child(div_4);
							var span = $.sibling(img, 2);
							var text = $.only_child(span, true);

							$.reset(div_4);

							var node_2 = $.sibling(div_4, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_5 = root_1();

									$.append($$anchor, div_5);
								};

								$.if(node_2, ($$render) => {
									if ($.get(provider).activeInSite && $.get(provider).isEnabled) $$render(consequent_1);
								});
							}

							$.template_effect(
								($0) => {
									$.set_attribute(img, 'src', $0);
									$.set_attribute(img, 'alt', $.get(provider).label);
									$.set_text(text, $.get(provider).label);
								},
								[() => clientResolver(resolve, $.get(provider).logo)]
							);

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div_3);

			var form = $.sibling(div_3, 2);
			var node_3 = $.child(form);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_6();
					var div_7 = $.child(div_6);
					var text_1 = $.only_child(div_7);
					var div_8 = $.sibling(div_7, 2);
					var node_4 = $.child(div_8);

					$.each(node_4, 17, () => $.get(selectedAnalytics).requirements, (req) => req.label, ($$anchor, req, $$index_1) => {
						var div_9 = root_3();
						var node_5 = $.child(div_9);

						Label(node_5, {
							get for() {
								return $.get(req).label;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(req).label));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						Input(node_6, {
							get type() {
								return $.get(req).type;
							},

							get id() {
								return $.get(req).label;
							},

							get placeholder() {
								return $.get(req).placeholder;
							},

							get required() {
								return $.get(req).required;
							},

							get value() {
								return $.get(req).value;
							},

							set value($$value) {
								($.get(req).value = $$value);
							}
						});

						$.reset(div_9);
						$.append($$anchor, div_9);
					});

					var div_10 = $.sibling(node_4, 2);
					var node_7 = $.child(div_10);

					Label(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Status');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => $.get(selectedAnalytics).isEnabled ? "enabled" : "disabled");

						$.component(node_8, () => Select.Root, ($$anchor, Select_Root) => {
							Select_Root($$anchor, {
								type: 'single',
								get value() {
									return $.get($0);
								},

								onValueChange: (value) => {
									if (!value || !$.get(selectedAnalytics)) return;

									$.get(selectedAnalytics).isEnabled = value === "enabled";
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_4();
									var node_9 = $.first_child(fragment_3);

									$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger) => {
										Select_Trigger($$anchor, {
											class: 'w-32',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, $.get(selectedAnalytics).isEnabled ? "Enable" : "Disable"));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
										Select_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_4();
												var node_11 = $.first_child(fragment_5);

												$.component(node_11, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, {
														value: 'enabled',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Enable');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Select.Item, ($$anchor, Select_Item_1) => {
													Select_Item_1($$anchor, {
														value: 'disabled',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Disable');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.reset(div_10);
					$.reset(div_8);

					var div_11 = $.sibling(div_8, 2);
					var node_13 = $.child(div_11);

					Button(node_13, {
						type: 'submit',
						get disabled() {
							return $.get(saving);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_6 = root_5();
							var text_7 = $.first_child(fragment_6);
							var node_14 = $.sibling(text_7);

							{
								var consequent_2 = ($$anchor) => {
									Loader($$anchor, { class: 'ml-2 inline size-4 animate-spin' });
								};

								$.if(node_14, ($$render) => {
									if ($.get(saving)) $$render(consequent_2);
								});
							}

							$.template_effect(() => $.set_text(text_7, `Save Changes for ${$.get(selectedAnalytics).label ?? ''} `));
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_11);
					$.reset(div_6);
					$.template_effect(() => $.set_text(text_1, `Add details for your ${$.get(selectedAnalytics).label ?? ''} account`));
					$.append($$anchor, div_6);
				};

				$.if(node_3, ($$render) => {
					if ($.get(selectedAnalytics)) $$render(consequent_3);
				});
			}

			$.reset(form);
			$.reset(div_2);

			$.event('submit', form, (e) => {
				e.preventDefault();
				saveAnalytics();
			});

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}