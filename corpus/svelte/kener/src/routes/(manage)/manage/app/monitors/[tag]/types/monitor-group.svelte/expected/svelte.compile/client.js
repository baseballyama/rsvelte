import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p class="text-muted-foreground text-sm">No eligible monitors available. Create some non-group monitors first.</p>`);
var root_1 = $.from_html(`<span class="text-xs">(must equal 1)</span>`);
var root_2 = $.from_html(`<div class="flex items-center gap-3"><div> <!></div> <!> <!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<img class="size-8 shrink-0 rounded object-cover"/>`);
var root_5 = $.from_html(`<div class="bg-muted flex size-8 shrink-0 items-center justify-center rounded text-xs font-medium"> </div>`);
var root_6 = $.from_html(`<div><div class="flex min-w-0 items-center gap-2"><!> <span class="text-muted-foreground text-xs font-medium"> </span> <!> <div class="min-w-0"><p class="flex items-center gap-1.5 truncate text-sm"> <!></p> <p class="text-muted-foreground truncate text-xs"> </p></div></div> <div class="flex shrink-0 items-center gap-1"><div class="flex items-center gap-1.5"><!> <!></div> <!> <!> <!></div></div>`);
var root_7 = $.from_html(`<div class="rounded-lg border"><div class="mb-2 border-b px-3 py-2"><p class="text-sm font-medium"> </p> <p class="text-muted-foreground text-xs">Monitors will be executed in this order. Use arrows to reorder.</p></div> <!></div>`);

var root_8 = $.from_html(`<div class="space-y-4"><div class="flex flex-col gap-2"><div class="flex flex-col gap-1"><!> <p class="text-muted-foreground text-xs">Group monitors aggregate the status of multiple monitors using weighted scores. Each status has a normalized
        score: UP=1, DEGRADED=0.5, DOWN=0. Maintenance members are treated as UP. The weighted sum determines the group
        status: 1=UP, between 0 and 1=DEGRADED, 0=DOWN.</p> <p class="text-muted-foreground text-xs"></p></div> <!></div> <!> <div class="grid gap-4 md:grid-cols-2"><div class="space-y-2"><div class="flex items-center justify-between"><!> <span class="text-muted-foreground text-xs"></span></div> <!> <p class="text-muted-foreground text-xs">Determines how long to wait for all child monitors before aggregating results.</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Choose how latency should be derived from the selected monitors.</p></div></div> <!></div>`);

export default function Monitor_group($$anchor, $$props) {
	$.push($$props, true);

	const LATENCY_CALCULATION_OPTIONS = ["AVG", "MAX", "MIN"];

	const LATENCY_CALCULATION_LABELS = {
		AVG: "Average (mean)",
		MAX: "Maximum (slowest)",
		MIN: "Minimum (fastest)"
	};

	let data = $.prop($$props, 'data', 27, () => $.proxy({})),
		availableMonitors = $.prop($$props, 'availableMonitors', 19, () => []),
		tag = $.prop($$props, 'tag', 3, "");

	const formData = data();
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

	let executionDelayInput = $.state($.proxy(String(formData.executionDelay)));

	const parsedExecutionDelay = $.derived(() => {
		const value = Number($.get(executionDelayInput));

		return Number.isFinite(value) ? value : MIN_DELAY_MS;
	});

	$.user_effect(() => {
		formData.executionDelay = $.get(parsedExecutionDelay);
	});

	// Filter out GROUP monitors - groups can't contain other groups - and the group being edited itself
	let eligibleMonitors = $.derived(() => availableMonitors().filter((m) => m.monitor_type !== "GROUP" && m.status === "ACTIVE" && m.tag !== tag()));

	let selectedTags = $.derived(() => formData.monitors.map((m) => m.tag));

	/** A stale member's monitor is no longer eligible (paused or deleted after being added). */
	function isStale(monitorTag) {
		return !$.get(eligibleMonitors).some((m) => m.tag === monitorTag);
	}

	let totalWeight = $.derived(() => Math.round(formData.monitors.reduce((sum, m) => sum + m.weight, 0) * 1000) / 1000);
	let weightsValid = $.derived(() => Math.abs($.get(totalWeight) - 1) < 0.001 || formData.monitors.length === 0);

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

	var div = root_8();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Monitors to Group');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 4);

	p.textContent = 'Select at least 2 monitors. Weights must sum to 1.';
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			MonitorPicker($$anchor, {
				get monitors() {
					return $.get(eligibleMonitors);
				},

				get selectedTags() {
					return $.get(selectedTags);
				},
				onToggle: toggleMonitor,
				onAddMany: addMonitors
			});
		};

		var alternate = ($$anchor) => {
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(eligibleMonitors).length > 0 || formData.monitors.length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_3 = root_2();
			var div_4 = $.child(div_3);
			var text_1 = $.child(div_4);
			var node_3 = $.sibling(text_1);

			{
				var consequent_1 = ($$anchor) => {
					var span = root_1();

					$.append($$anchor, span);
				};

				$.if(node_3, ($$render) => {
					if (!$.get(weightsValid)) $$render(consequent_1);
				});
			}

			$.reset(div_4);

			var node_4 = $.sibling(div_4, 2);

			Button(node_4, {
				type: 'button',
				variant: 'link',
				size: 'sm',
				class: 'text-muted-foreground hover:text-foreground h-auto p-0 text-xs',
				onclick: distributeEqually,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Distribute equally');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				type: 'button',
				variant: 'link',
				size: 'sm',
				class: 'text-muted-foreground hover:text-destructive h-auto p-0 text-xs',
				onclick: clearAll,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Clear all');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			$.template_effect(() => {
				$.set_class(div_4, 1, `flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${$.get(weightsValid)
					? 'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
					: 'border-destructive/50 text-destructive bg-red-50 dark:bg-red-950'}`);

				$.set_text(text_1, `Total weight: ${$.get(totalWeight) ?? ''} `);
			});

			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if (formData.monitors.length > 0) $$render(consequent_2);
		});
	}

	var div_5 = $.sibling(node_2, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var node_6 = $.child(div_7);

	Label(node_6, {
		for: 'group-execution-delay',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Execution Delay (ms)');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var span_1 = $.sibling(node_6, 2);

	span_1.textContent = 'Minimum 1000ms';
	$.reset(div_7);

	var node_7 = $.sibling(div_7, 2);

	Input(node_7, {
		id: 'group-execution-delay',
		type: 'number',
		min: MIN_DELAY_MS,
		step: 100,
		get value() {
			return $.get(executionDelayInput);
		},

		set value($$value) {
			$.set(executionDelayInput, $$value, true);
		}
	});

	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var node_8 = $.child(div_8);

	Label(node_8, {
		for: 'group-latency-calculation',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Latency calculation');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return formData.latencyCalculation;
			},

			onValueChange: (value) => {
				if (value && LATENCY_CALCULATION_OPTIONS.includes(value)) {
					formData.latencyCalculation = value;
				}
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_10 = $.first_child(fragment_1);

				$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'group-latency-calculation',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, LATENCY_CALCULATION_LABELS[formData.latencyCalculation]));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_12 = $.first_child(fragment_3);

							$.each(node_12, 16, () => LATENCY_CALCULATION_OPTIONS, (option) => option, ($$anchor, option) => {
								var fragment_4 = $.comment();
								var node_13 = $.first_child(fragment_4);

								$.component(node_13, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return option;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text();

											$.template_effect(() => $.set_text(text_7, LATENCY_CALCULATION_LABELS[option]));
											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_8);
	$.reset(div_5);

	var node_14 = $.sibling(div_5, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_9 = root_7();
			var div_10 = $.child(div_9);
			var p_2 = $.child(div_10);
			var text_8 = $.only_child(p_2);

			$.next(2);
			$.reset(div_10);

			var node_15 = $.sibling(div_10, 2);

			$.each(node_15, 19, () => formData.monitors, (m) => m.tag, ($$anchor, m, index) => {
				const monitorInfo = $.derived(() => availableMonitors().find((am) => am.tag === $.get(m).tag));
				const stale = $.derived(() => isStale($.get(m).tag));
				var div_11 = root_6();
				var div_12 = $.child(div_11);
				var node_16 = $.child(div_12);

				GripVertical(node_16, { class: 'text-muted-foreground h-4 w-4 shrink-0' });

				var span_2 = $.sibling(node_16, 2);
				var text_9 = $.only_child(span_2);
				var node_17 = $.sibling(span_2, 2);

				{
					var consequent_3 = ($$anchor) => {
						var img = root_4();

						$.template_effect(
							($0) => {
								$.set_attribute(img, 'src', $0);
								$.set_attribute(img, 'alt', $.get(monitorInfo).name);
							},
							[() => clientResolver(resolve, $.get(monitorInfo).image)]
						);

						$.append($$anchor, img);
					};

					var alternate_1 = ($$anchor) => {
						var div_13 = root_5();
						var text_10 = $.only_child(div_13, true);

						$.template_effect(($0) => $.set_text(text_10, $0), [
							() => ($.get(monitorInfo)?.name || $.get(m).tag).charAt(0).toUpperCase()
						]);

						$.append($$anchor, div_13);
					};

					$.if(node_17, ($$render) => {
						if ($.get(monitorInfo)?.image) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				var div_14 = $.sibling(node_17, 2);
				var p_3 = $.child(div_14);
				var text_11 = $.child(p_3);
				var node_18 = $.sibling(text_11);

				{
					var consequent_4 = ($$anchor) => {
						Badge($$anchor, {
							variant: 'outline',
							class: 'text-muted-foreground shrink-0 text-[10px]',
							title: 'Not currently checked; excluded from group score',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('inactive');

								$.append($$anchor, text_12);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_18, ($$render) => {
						if ($.get(stale)) $$render(consequent_4);
					});
				}

				$.reset(p_3);

				var p_4 = $.sibling(p_3, 2);
				var text_13 = $.only_child(p_4, true);

				$.reset(div_14);
				$.reset(div_12);

				var div_15 = $.sibling(div_12, 2);
				var div_16 = $.child(div_15);
				var node_19 = $.child(div_16);

				Label(node_19, {
					class: 'text-muted-foreground text-xs',
					get for() {
						return `group-member-weight-${$.get(m).tag ?? ''}`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('Weight');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_19, 2);

				{
					let $0 = $.derived(() => String($.get(m).weight));

					Input(node_20, {
						get id() {
							return `group-member-weight-${$.get(m).tag ?? ''}`;
						},
						type: 'number',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get($0);
						},
						class: 'h-8 w-[80px] text-xs',
						onchange: (e) => {
							const target = e.currentTarget;

							setWeight($.get(m).tag, Number(target.value));
						}
					});
				}

				$.reset(div_16);

				var node_21 = $.sibling(div_16, 2);

				{
					let $0 = $.derived(() => $.get(index) === 0);

					Button(node_21, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-7 w-7',
						get disabled() {
							return $.get($0);
						},
						onclick: () => moveMonitorUp($.get(index)),
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, { class: 'h-3.5 w-3.5' });
						},
						$$slots: { default: true }
					});
				}

				var node_22 = $.sibling(node_21, 2);

				{
					let $0 = $.derived(() => $.get(index) === formData.monitors.length - 1);

					Button(node_22, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-7 w-7',
						get disabled() {
							return $.get($0);
						},
						onclick: () => moveMonitorDown($.get(index)),
						children: ($$anchor, $$slotProps) => {
							ArrowDown($$anchor, { class: 'h-3.5 w-3.5' });
						},
						$$slots: { default: true }
					});
				}

				var node_23 = $.sibling(node_22, 2);

				Button(node_23, {
					variant: 'ghost',
					size: 'icon',
					class: 'hover:text-destructive h-7 w-7',
					title: 'Remove from group',
					onclick: () => removeMonitor($.get(m).tag),
					children: ($$anchor, $$slotProps) => {
						X($$anchor, { class: 'h-3.5 w-3.5' });
					},
					$$slots: { default: true }
				});

				$.reset(div_15);
				$.reset(div_11);

				$.template_effect(() => {
					$.set_class(div_11, 1, `flex items-center justify-between gap-2 px-3 py-2 ${$.get(index) < formData.monitors.length - 1 ? 'border-b' : ''}`);
					$.set_text(text_9, `${$.get(index) + 1}.`);
					$.set_text(text_11, `${($.get(monitorInfo)?.name || $.get(m).tag) ?? ''} `);
					$.set_text(text_13, $.get(m).tag);
				});

				$.append($$anchor, div_11);
			});

			$.reset(div_9);
			$.template_effect(() => $.set_text(text_8, `Selected: ${formData.monitors.length ?? ''} monitor(s) — Execution Order`));
			$.append($$anchor, div_9);
		};

		$.if(node_14, ($$render) => {
			if (formData.monitors.length > 0) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}