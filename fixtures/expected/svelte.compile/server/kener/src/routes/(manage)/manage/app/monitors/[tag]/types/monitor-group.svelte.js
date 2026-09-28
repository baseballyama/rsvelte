import * as $ from 'svelte/internal/server';
import { Label } from "$lib/components/ui/label/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import MonitorPicker from "$lib/components/MonitorPicker.svelte";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import ArrowDown from "@lucide/svelte/icons/arrow-down";
import GripVertical from "@lucide/svelte/icons/grip-vertical";
import X from "@lucide/svelte/icons/x";
import clientResolver from "$lib/client/resolver.js";
import { resolve } from "$app/paths";

export default function Monitor_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const LATENCY_CALCULATION_OPTIONS = ["AVG", "MAX", "MIN"];

		const LATENCY_CALCULATION_LABELS = {
			AVG: "Average (mean)",
			MAX: "Maximum (slowest)",
			MIN: "Minimum (fastest)"
		};

		let { data = {}, availableMonitors = [], tag = "" } = $$props;
		const formData = data;
		const MIN_SELECTED_MONITORS = 2;
		const MIN_DELAY_MS = 1000;

		// Initialize defaults if not set
		if (!Array.isArray(formData.monitors)) formData.monitors = [];

		if (typeof formData.executionDelay !== "number" || !Number.isFinite(formData.executionDelay) || formData.executionDelay < MIN_DELAY_MS) {
			formData.executionDelay = MIN_DELAY_MS;
		}

		if (!LATENCY_CALCULATION_OPTIONS.includes(formData.latencyCalculation)) {
			formData.latencyCalculation = "AVG";
		}

		let executionDelayInput = String(formData.executionDelay);

		const parsedExecutionDelay = $.derived(() => {
			const value = Number(executionDelayInput);

			return Number.isFinite(value) ? value : MIN_DELAY_MS;
		});

		// Filter out GROUP monitors - groups can't contain other groups - and the group being edited itself
		let eligibleMonitors = $.derived(() => availableMonitors.filter((m) => m.monitor_type !== "GROUP" && m.status === "ACTIVE" && m.tag !== tag));

		let selectedTags = $.derived(() => formData.monitors.map((m) => m.tag));

		/** A stale member's monitor is no longer eligible (paused or deleted after being added). */
		function isStale(monitorTag) {
			return !eligibleMonitors().some((m) => m.tag === monitorTag);
		}

		let totalWeight = $.derived(() => Math.round(formData.monitors.reduce((sum, m) => sum + m.weight, 0) * 1000) / 1000);
		let weightsValid = $.derived(() => Math.abs(totalWeight() - 1) < 0.001 || formData.monitors.length === 0);

		function isSelected(monitorTag) {
			return formData.monitors.some((m) => m.tag === monitorTag);
		}

		/** Distribute weights equally across all selected monitors. */
		function distributeEqually() {
			const count = formData.monitors.length;

			if (count === 0) return;

			const weight = Math.round(1 / count * 1000) / 1000;

			formData.monitors = formData.monitors.map((m, i) => ({
				...m,
				// Give the last monitor the remainder to ensure sum = 1
				weight: i === count - 1
					? Math.round((1 - weight * (count - 1)) * 1000) / 1000
					: weight
			}));
		}

		function toggleMonitor(monitorTag) {
			if (isSelected(monitorTag)) {
				formData.monitors = formData.monitors.filter((m) => m.tag !== monitorTag);
			} else {
				formData.monitors = [...formData.monitors, { tag: monitorTag, weight: 0 }];
			}

			distributeEqually();
		}

		function addMonitors(tags) {
			const newTags = tags.filter((t) => !isSelected(t));

			if (newTags.length === 0) return;

			formData.monitors = [
				...formData.monitors,
				...newTags.map((t) => ({ tag: t, weight: 0 }))
			];

			distributeEqually();
		}

		function removeMonitor(monitorTag) {
			formData.monitors = formData.monitors.filter((m) => m.tag !== monitorTag);
			distributeEqually();
		}

		function clearAll() {
			formData.monitors = [];
		}

		function setWeight(monitorTag, weight) {
			formData.monitors = formData.monitors.map((m) => {
				if (m.tag !== monitorTag) return m;

				return {
					...m,
					weight: Math.min(1, Math.max(0, Math.round(weight * 1000) / 1000))
				};
			});
		}

		function moveMonitorUp(index) {
			if (index <= 0) return;

			const arr = [...formData.monitors];

			[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
			formData.monitors = arr;
		}

		function moveMonitorDown(index) {
			if (index >= formData.monitors.length - 1) return;

			const arr = [...formData.monitors];

			[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
			formData.monitors = arr;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="flex flex-col gap-2"><div class="flex flex-col gap-1">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select Monitors to Group`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Group monitors aggregate the status of multiple monitors using weighted scores. Each status has a normalized
        score: UP=1, DEGRADED=0.5, DOWN=0. Maintenance members are treated as UP. The weighted sum determines the group
        status: 1=UP, between 0 and 1=DEGRADED, 0=DOWN.</p> <p class="text-muted-foreground text-xs">Select at least 2 monitors. Weights must sum to 1.</p></div> `);

			if (eligibleMonitors().length > 0 || formData.monitors.length > 0) {
				$$renderer.push('<!--[0-->');

				MonitorPicker($$renderer, {
					monitors: eligibleMonitors(),
					selectedTags: selectedTags(),
					onToggle: toggleMonitor,
					onAddMany: addMonitors
				});
			} else {
				$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-sm">No eligible monitors available. Create some non-group monitors first.</p>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (formData.monitors.length > 0) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-3"><div${$.attr_class(`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${weightsValid()
					? 'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
					: 'border-destructive/50 text-destructive bg-red-50 dark:bg-red-950'}`)}>Total weight: ${$.escape(totalWeight())} `);

				if (!weightsValid()) {
					$$renderer.push(`<!--[0--><span class="text-xs">(must equal 1)</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				Button($$renderer, {
					type: 'button',
					variant: 'link',
					size: 'sm',
					class: 'text-muted-foreground hover:text-foreground h-auto p-0 text-xs',
					onclick: distributeEqually,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Distribute equally`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'button',
					variant: 'link',
					size: 'sm',
					class: 'text-muted-foreground hover:text-destructive h-auto p-0 text-xs',
					onclick: clearAll,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear all`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="grid gap-4 md:grid-cols-2"><div class="space-y-2"><div class="flex items-center justify-between">`);

			Label($$renderer, {
				for: 'group-execution-delay',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Execution Delay (ms)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">Minimum 1000ms</span></div> `);

			Input($$renderer, {
				id: 'group-execution-delay',
				type: 'number',
				min: MIN_DELAY_MS,
				step: 100,
				get value() {
					return executionDelayInput;
				},

				set value($$value) {
					executionDelayInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Determines how long to wait for all child monitors before aggregating results.</p></div> <div class="space-y-2">`);

			Label($$renderer, {
				for: 'group-latency-calculation',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Latency calculation`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: formData.latencyCalculation,
					onValueChange: (value) => {
						if (value && LATENCY_CALCULATION_OPTIONS.includes(value)) {
							formData.latencyCalculation = value;
						}
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'group-latency-calculation',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(LATENCY_CALCULATION_LABELS[formData.latencyCalculation])}`);
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
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(LATENCY_CALCULATION_OPTIONS);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let option = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: option,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(LATENCY_CALCULATION_LABELS[option])}`);
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

			$$renderer.push(` <p class="text-muted-foreground text-xs">Choose how latency should be derived from the selected monitors.</p></div></div> `);

			if (formData.monitors.length > 0) {
				$$renderer.push(`<!--[0--><div class="rounded-lg border"><div class="mb-2 border-b px-3 py-2"><p class="text-sm font-medium">Selected: ${$.escape(formData.monitors.length)} monitor(s) — Execution Order</p> <p class="text-muted-foreground text-xs">Monitors will be executed in this order. Use arrows to reorder.</p></div> <!--[-->`);

				const each_array_1 = $.ensure_array_like(formData.monitors);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let m = each_array_1[index];
					const monitorInfo = availableMonitors.find((am) => am.tag === m.tag);
					const stale = isStale(m.tag);

					$$renderer.push(`<div${$.attr_class(`flex items-center justify-between gap-2 px-3 py-2 ${index < formData.monitors.length - 1 ? 'border-b' : ''}`)}><div class="flex min-w-0 items-center gap-2">`);
					GripVertical($$renderer, { class: 'text-muted-foreground h-4 w-4 shrink-0' });
					$$renderer.push(`<!----> <span class="text-muted-foreground text-xs font-medium">${$.escape(index + 1)}.</span> `);

					if (monitorInfo?.image) {
						$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, monitorInfo.image))}${$.attr('alt', monitorInfo.name)} class="size-8 shrink-0 rounded object-cover"/>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="bg-muted flex size-8 shrink-0 items-center justify-center rounded text-xs font-medium">${$.escape((monitorInfo?.name || m.tag).charAt(0).toUpperCase())}</div>`);
					}

					$$renderer.push(`<!--]--> <div class="min-w-0"><p class="flex items-center gap-1.5 truncate text-sm">${$.escape(monitorInfo?.name || m.tag)} `);

					if (stale) {
						$$renderer.push('<!--[0-->');

						Badge($$renderer, {
							variant: 'outline',
							class: 'text-muted-foreground shrink-0 text-[10px]',
							title: 'Not currently checked; excluded from group score',
							children: ($$renderer) => {
								$$renderer.push(`<!---->inactive`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></p> <p class="text-muted-foreground truncate text-xs">${$.escape(m.tag)}</p></div></div> <div class="flex shrink-0 items-center gap-1"><div class="flex items-center gap-1.5">`);

					Label($$renderer, {
						class: 'text-muted-foreground text-xs',
						for: `group-member-weight-${$.stringify(m.tag)}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Weight`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: `group-member-weight-${$.stringify(m.tag)}`,
						type: 'number',
						min: 0,
						max: 1,
						step: 0.01,
						value: String(m.weight),
						class: 'h-8 w-[80px] text-xs',
						onchange: (e) => {
							const target = e.currentTarget;

							setWeight(m.tag, Number(target.value));
						}
					});

					$$renderer.push(`<!----></div> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-7 w-7',
						disabled: index === 0,
						onclick: () => moveMonitorUp(index),
						children: ($$renderer) => {
							ArrowUp($$renderer, { class: 'h-3.5 w-3.5' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-7 w-7',
						disabled: index === formData.monitors.length - 1,
						onclick: () => moveMonitorDown(index),
						children: ($$renderer) => {
							ArrowDown($$renderer, { class: 'h-3.5 w-3.5' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'hover:text-destructive h-7 w-7',
						title: 'Remove from group',
						onclick: () => removeMonitor(m.tag),
						children: ($$renderer) => {
							X($$renderer, { class: 'h-3.5 w-3.5' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}