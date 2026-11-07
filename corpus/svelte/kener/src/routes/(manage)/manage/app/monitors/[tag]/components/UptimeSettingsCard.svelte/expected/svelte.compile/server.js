import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function UptimeSettingsCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor, typeData, uptimeSettings = void 0 } = $$props;
		let savingUptimeSettings = false;

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

		const isUptimeSettingsValid = $.derived(() => isValidUptimeFormula(uptimeSettings.uptime_formula_numerator) && isValidUptimeFormula(uptimeSettings.uptime_formula_denominator));

		async function saveUptimeSettings() {
			if (!isUptimeSettingsValid()) {
				toast.error("Invalid uptime formula. Use: up, down, degraded, maintenance with +, -, *, /");

				return;
			}

			savingUptimeSettings = true;

			try {
				const payload = {
					...monitor,
					type_data: JSON.stringify(typeData),
					monitor_settings_json: JSON.stringify(uptimeSettings)
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
				savingUptimeSettings = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Uptime Calculation`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Customize how uptime percentage is calculated for this monitor`);
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

						$$renderer.push(` `);

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'space-y-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex gap-2">`);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->a =`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');

													InputGroup.Input($$renderer, {
														placeholder: 'up + maintenance',
														class: !isValidUptimeFormula(uptimeSettings.uptime_formula_numerator) ? "border-destructive" : "",
														get value() {
															return uptimeSettings.uptime_formula_numerator;
														},

														set value($$value) {
															uptimeSettings.uptime_formula_numerator = $$value;
															$$settled = false;
														}
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

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->b =`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');

													InputGroup.Input($$renderer, {
														placeholder: 'up + maintenance + down + degraded',
														class: !isValidUptimeFormula(uptimeSettings.uptime_formula_denominator) ? "border-destructive" : "",
														get value() {
															return uptimeSettings.uptime_formula_denominator;
														},

														set value($$value) {
															uptimeSettings.uptime_formula_denominator = $$value;
															$$settled = false;
														}
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

									$$renderer.push(`</div> <div class="text-muted-foreground text-sm"><p><strong>Uptime % = (a / b) × 100</strong></p> <p class="mt-2 text-xs">Valid variables: <code class="bg-muted rounded px-1">up</code>, <code class="bg-muted rounded px-1">down</code>, <code class="bg-muted rounded px-1">degraded</code>, <code class="bg-muted rounded px-1">maintenance</code></p> <p class="text-xs">Valid operators: <code class="bg-muted rounded px-1">+</code>, <code class="bg-muted rounded px-1">-</code>, <code class="bg-muted rounded px-1">*</code>, <code class="bg-muted rounded px-1">/</code></p></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'flex justify-end',
								children: ($$renderer) => {
									Button($$renderer, {
										onclick: saveUptimeSettings,
										disabled: savingUptimeSettings || !isUptimeSettingsValid(),
										children: ($$renderer) => {
											if (savingUptimeSettings) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
											}

											$$renderer.push(`<!--]--> Save Uptime Settings`);
										},
										$$slots: { default: true }
									});
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { uptimeSettings });
	});
}