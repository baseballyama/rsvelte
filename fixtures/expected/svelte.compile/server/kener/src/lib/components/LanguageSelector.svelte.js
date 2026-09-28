import * as $ from 'svelte/internal/server';
import * as Select from "$lib/components/ui/select/index.js";
import { i18n, t } from "$lib/stores/i18n";
import Languages from "@lucide/svelte/icons/languages";
import { cn } from "$lib/utils.js";
import trackEvent from "$lib/beacon";

export default function LanguageSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { compact = false } = $$props;

		// Get the current locale from the store
		let selectedLang = $.store_get($$store_subs ??= {}, '$i18n', i18n).currentLocale;

		// Update selected lang when store changes
		// Handle locale change
		async function handleLocaleChange(newLocale) {
			if (newLocale && newLocale !== $.store_get($$store_subs ??= {}, '$i18n', i18n).currentLocale) {
				await i18n.setLocale(newLocale);
				trackEvent("language_changed", { locale: newLocale });
			}
		}

		// Watch for selection changes
		const triggerContent = $.derived(() => $.store_get($$store_subs ??= {}, '$i18n', i18n).availableLocales.find((l) => l.code === selectedLang)?.name ?? "Select Language");

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$i18n', i18n).availableLocales.length > 1) {
				$$renderer.push('<!--[0-->');

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						name: 'language',
						get value() {
							return selectedLang;
						},

						set value($$value) {
							selectedLang = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									size: 'sm',
									class: cn("ksel hover:text-accent-foreground bg-background/80 dark:bg-background/70 border-foreground/15 flex cursor-pointer justify-center rounded-full border text-xs font-medium shadow-none backdrop-blur-md", compact ? "size-8 p-0" : "max-w-[10rem] sm:max-w-none"),
									children: ($$renderer) => {
										Languages($$renderer, { class: 'text-inherit' });
										$$renderer.push(`<!----> `);

										if (compact) {
											$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(triggerContent())}</span>`);
										} else {
											$$renderer.push(`<!--[-1--><span class="truncate">${$.escape(triggerContent())}</span>`);
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

							$$renderer.push(` `);

							if (Select.Content) {
								$$renderer.push('<!--[-->');

								Select.Content($$renderer, {
									children: ($$renderer) => {
										if (Select.Group) {
											$$renderer.push('<!--[-->');

											Select.Group($$renderer, {
												children: ($$renderer) => {
													if (Select.Label) {
														$$renderer.push('<!--[-->');

														Select.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Select Language"))}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` <!--[-->`);

													const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$i18n', i18n).availableLocales);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let locale = each_array[$$index];

														if (Select.Item) {
															$$renderer.push('<!--[-->');

															Select.Item($$renderer, {
																class: 'text-xs',
																value: locale.code,
																label: locale.name,
																disabled: locale.disabled,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(locale.name)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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