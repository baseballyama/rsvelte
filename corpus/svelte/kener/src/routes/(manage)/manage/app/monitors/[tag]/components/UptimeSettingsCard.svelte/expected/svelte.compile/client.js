import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-2"><!> <!></div> <div class="text-muted-foreground text-sm"><p><strong>Uptime % = (a / b) × 100</strong></p> <p class="mt-2 text-xs">Valid variables: <code class="bg-muted rounded px-1">up</code>, <code class="bg-muted rounded px-1">down</code>, <code class="bg-muted rounded px-1">degraded</code>, <code class="bg-muted rounded px-1">maintenance</code></p> <p class="text-xs">Valid operators: <code class="bg-muted rounded px-1">+</code>, <code class="bg-muted rounded px-1">-</code>, <code class="bg-muted rounded px-1">*</code>, <code class="bg-muted rounded px-1">/</code></p></div>`, 1);
var root_2 = $.from_html(`<!> Save Uptime Settings`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function UptimeSettingsCard($$anchor, $$props) {
	$.push($$props, true);

	let uptimeSettings = $.prop($$props, 'uptimeSettings', 15);
	let savingUptimeSettings = $.state(false);

	// Validate uptime formula
	function isValidUptimeFormula(formula) {
		if (!formula || typeof formula !== "string") return false;

		const normalized = formula.toLowerCase().replace(/\s+/g, "");

		if (normalized.length === 0) return false;

		const validVars = ["up", "down", "degraded", "maintenance"];
		const validOperators = ["+", "-", "*", "/"];
		const tokens = [];
		let currentToken = "";

		for (const char of normalized) {
			if (validOperators.includes(char)) {
				if (currentToken) {
					tokens.push(currentToken);
					currentToken = "";
				}

				tokens.push(char);
			} else {
				currentToken += char;
			}
		}

		if (currentToken) {
			tokens.push(currentToken);
		}

		if (tokens.length === 0) return false;

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (i % 2 === 0) {
				if (!validVars.includes(token)) return false;
			} else {
				if (!validOperators.includes(token)) return false;
			}
		}

		if (tokens.length % 2 === 0) return false;

		return true;
	}

	const isUptimeSettingsValid = $.derived(() => isValidUptimeFormula(uptimeSettings().uptime_formula_numerator) && isValidUptimeFormula(uptimeSettings().uptime_formula_denominator));

	async function saveUptimeSettings() {
		if (!$.get(isUptimeSettingsValid)) {
			toast.error("Invalid uptime formula. Use: up, down, degraded, maintenance with +, -, *, /");

			return;
		}

		$.set(savingUptimeSettings, true);

		try {
			const payload = {
				...$$props.monitor,
				type_data: JSON.stringify($$props.typeData),
				monitor_settings_json: JSON.stringify(uptimeSettings())
			};

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "storeMonitorData", data: payload })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Uptime settings saved successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to save uptime settings";

			toast.error(message);
		} finally {
			$.set(savingUptimeSettings, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Uptime Calculation');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Customize how uptime percentage is calculated for this monitor');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var node_5 = $.child(div);

							$.component(node_5, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
											InputGroup_Addon($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('a =');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										{
											let $0 = $.derived(() => !isValidUptimeFormula(uptimeSettings().uptime_formula_numerator) ? "border-destructive" : "");

											$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
												InputGroup_Input($$anchor, {
													placeholder: 'up + maintenance',
													get class() {
														return $.get($0);
													},

													get value() {
														return uptimeSettings().uptime_formula_numerator;
													},

													set value($$value) {
														uptimeSettings(uptimeSettings().uptime_formula_numerator = $$value, true);
													}
												});
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_5, 2);

							$.component(node_8, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
								InputGroup_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_9 = $.first_child(fragment_5);

										$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
											InputGroup_Addon_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('b =');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										{
											let $0 = $.derived(() => !isValidUptimeFormula(uptimeSettings().uptime_formula_denominator) ? "border-destructive" : "");

											$.component(node_10, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
												InputGroup_Input_1($$anchor, {
													placeholder: 'up + maintenance + down + degraded',
													get class() {
														return $.get($0);
													},

													get value() {
														return uptimeSettings().uptime_formula_denominator;
													},

													set value($$value) {
														uptimeSettings(uptimeSettings().uptime_formula_denominator = $$value, true);
													}
												});
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_4, 2);

				$.component(node_11, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex justify-end',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => $.get(savingUptimeSettings) || !$.get(isUptimeSettingsValid));

								Button($$anchor, {
									onclick: saveUptimeSettings,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_2();
										var node_12 = $.first_child(fragment_7);

										{
											var consequent = ($$anchor) => {
												Loader($$anchor, { class: 'size-4 animate-spin' });
											};

											var alternate = ($$anchor) => {
												SaveIcon($$anchor, { class: 'size-4' });
											};

											$.if(node_12, ($$render) => {
												if ($.get(savingUptimeSettings)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.next();
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}