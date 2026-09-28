import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/components/ui/select/index.js";
import { i18n, t } from "$lib/stores/i18n";
import Languages from "@lucide/svelte/icons/languages";
import { cn } from "$lib/utils.js";
import trackEvent from "$lib/beacon";

var root = $.from_html(`<span class="sr-only"> </span>`);
var root_1 = $.from_html(`<span class="truncate"> </span>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function LanguageSelector($$anchor, $$props) {
	$.push($$props, true);

	const $i18n = () => $.store_get(i18n, '$i18n', $$stores);
	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let compact = $.prop($$props, 'compact', 3, false);

	// Get the current locale from the store
	let selectedLang = $.state($.proxy($i18n().currentLocale));

	// Update selected lang when store changes
	$.user_effect(() => {
		$.set(selectedLang, $i18n().currentLocale, true);
	});

	// Handle locale change
	async function handleLocaleChange(newLocale) {
		if (newLocale && newLocale !== $i18n().currentLocale) {
			await i18n.setLocale(newLocale);
			trackEvent("language_changed", { locale: newLocale });
		}
	}

	// Watch for selection changes
	$.user_effect(() => {
		if ($.get(selectedLang) && $.get(selectedLang) !== $i18n().currentLocale) {
			handleLocaleChange($.get(selectedLang));
		}
	});

	const triggerContent = $.derived(() => $i18n().availableLocales.find((l) => l.code === $.get(selectedLang))?.name ?? "Select Language");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					name: 'language',
					get value() {
						return $.get(selectedLang);
					},

					set value($$value) {
						$.set(selectedLang, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => cn("ksel hover:text-accent-foreground bg-background/80 dark:bg-background/70 border-foreground/15 flex cursor-pointer justify-center rounded-full border text-xs font-medium shadow-none backdrop-blur-md", compact() ? "size-8 p-0" : "max-w-[10rem] sm:max-w-none"));

							$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
								Select_Trigger($$anchor, {
									size: 'sm',
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_3 = $.first_child(fragment_3);

										Languages(node_3, { class: 'text-inherit' });

										var node_4 = $.sibling(node_3, 2);

										{
											var consequent = ($$anchor) => {
												var span = root();
												var text = $.only_child(span, true);

												$.template_effect(() => $.set_text(text, $.get(triggerContent)));
												$.append($$anchor, span);
											};

											var alternate = ($$anchor) => {
												var span_1 = root_1();
												var text_1 = $.only_child(span_1, true);

												$.template_effect(() => $.set_text(text_1, $.get(triggerContent)));
												$.append($$anchor, span_1);
											};

											$.if(node_4, ($$render) => {
												if (compact()) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_2();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => Select.Label, ($$anchor, Select_Label) => {
													Select_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("Select Language")]);
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.each(node_8, 1, () => $i18n().availableLocales, (locale) => locale.code, ($$anchor, locale) => {
													var fragment_7 = $.comment();
													var node_9 = $.first_child(fragment_7);

													$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															class: 'text-xs',
															get value() {
																return $.get(locale).code;
															},

															get label() {
																return $.get(locale).name;
															},

															get disabled() {
																return $.get(locale).disabled;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, $.get(locale).name));
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
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
		};

		$.if(node, ($$render) => {
			if ($i18n().availableLocales.length > 1) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}