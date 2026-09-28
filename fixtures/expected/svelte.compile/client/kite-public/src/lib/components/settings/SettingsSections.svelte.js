import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { dragHandle, dragHandleZone } from 'svelte-dnd-action';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { sections } from '$lib/stores/sections.svelte.js';

var root = $.from_html(`<button class="focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600 opacity-60 cursor-not-allowed" role="switch" disabled=""><span class="inline-block h-4 w-4 transform rounded-full bg-white transition ltr:translate-x-6 rtl:-translate-x-6"></span></button>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!></div>`);
var root_2 = $.from_html(`<button role="switch"><span></span></button>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"><div class="flex items-center space-x-3"><div class="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-manipulation"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="4" r="1"></circle><circle cx="3" cy="8" r="1"></circle><circle cx="3" cy="12" r="1"></circle><circle cx="8" cy="4" r="1"></circle><circle cx="8" cy="8" r="1"></circle><circle cx="8" cy="12" r="1"></circle></svg></div> <span class="text-sm font-medium text-gray-700 dark:text-gray-300"> </span></div> <!></div>`);
var root_4 = $.from_html(`<span class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="inline-block"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path></svg> </span>`);
var root_5 = $.from_html(`<button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded"> </button>`);
var root_6 = $.from_html(`<div class="space-y-4"><div><h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <div class="mb-3 flex justify-between items-center"><p class="text-xs text-gray-500 dark:text-gray-400"> </p> <button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 me-2 focus-visible-ring rounded"> </button></div> <div class="space-y-2"></div></div> <div class="text-center mb-4"><!></div></div>`);

export default function SettingsSections($$anchor, $$props) {
	$.push($$props, true);

	// Local state for sections with required ID field
	let sectionItems = $.state($.proxy([]));

	const flipDurationMs = 200;
	let showResetConfirmation = $.state(false);

	// Initialize sections when store changes
	$.user_effect(() => {
		// Convert sections to drag-drop format
		console.log('[SettingsSections Component] $effect triggered - sections.list changed');

		console.log('[SettingsSections Component] First 3 sections:', sections.list.slice(0, 3).map((s) => ({ id: s.id, order: s.order })));
		$.set(sectionItems, sections.list.sort((a, b) => a.order - b.order).map((section) => ({ ...section, id: section.id })), true);
	});

	// Handle drag and drop
	function handleConsider(e) {
		$.set(sectionItems, e.detail.items, true);
	}

	function handleFinalize(e) {
		$.set(sectionItems, e.detail.items, true);
		updateSectionOrder();
	}

	function updateSectionOrder() {
		// Update the order of all sections based on their new positions
		$.get(sectionItems).forEach((section, index) => {
			sections.setOrder(section.id, index + 1);
		});
	}

	// Toggle section enabled state
	function toggleSection(sectionId) {
		sections.toggleSection(sectionId);
	}

	// Reset to defaults
	function resetToDefaults() {
		sections.reset();
		$.set(showResetConfirmation, true);

		// Hide confirmation after 1 second
		setTimeout(
			() => {
				$.set(showResetConfirmation, false);
			},
			1000
		);
	}

	// Get localized section name
	function getSectionName(id) {
		const key = `section.${id}`;

		return s(key) || id.charAt(0).toUpperCase() + id.slice(1);
	}

	var div = root_6();
	var div_1 = $.child(div);
	var h4 = $.child(div_1);
	var text = $.only_child(h4, true);
	var div_2 = $.sibling(h4, 2);
	var p = $.child(div_2);
	var text_1 = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var text_2 = $.only_child(button, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);

	$.each(div_3, 29, () => $.get(sectionItems), (section) => section.id, ($$anchor, section) => {
		var div_4 = root_3();
		var div_5 = $.child(div_4);
		var div_6 = $.child(div_5);

		$.action(div_6, ($$node) => dragHandle?.($$node));

		var span = $.sibling(div_6, 2);
		var text_3 = $.only_child(span, true);

		$.reset(div_5);

		var node = $.sibling(div_5, 2);

		{
			var consequent = ($$anchor) => {
				var div_7 = root_1();
				var node_1 = $.child(div_7);

				{
					let $0 = $.derived(() => s("settings.sections.sourcesRequired") || "Sources are always shown to maintain transparency and credibility");

					Tooltip(node_1, {
						get text() {
							return $.get($0);
						},
						position: 'left',
						children: ($$anchor, $$slotProps) => {
							var button_1 = root();

							$.set_attribute(button_1, 'aria-checked', true);

							$.template_effect(($0) => $.set_attribute(button_1, 'aria-label', $0), [
								() => `${getSectionName($.get(section).id)} (always enabled)`
							]);

							$.append($$anchor, button_1);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_7);
				$.append($$anchor, div_7);
			};

			var alternate = ($$anchor) => {
				var button_2 = root_2();
				let classes;
				var span_1 = $.child(button_2);
				let classes_1;

				$.reset(button_2);

				$.template_effect(
					($0) => {
						classes = $.set_class(button_2, 1, 'focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors', null, classes, {
							'bg-blue-600': $.get(section).enabled,
							'bg-gray-200': !$.get(section).enabled,
							'dark:bg-gray-600': !$.get(section).enabled
						});

						$.set_attribute(button_2, 'aria-checked', $.get(section).enabled);
						$.set_attribute(button_2, 'aria-label', $0);

						classes_1 = $.set_class(span_1, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_1, {
							'ltr:translate-x-6': $.get(section).enabled,
							'rtl:-translate-x-6': $.get(section).enabled,
							'ltr:translate-x-1': !$.get(section).enabled,
							'rtl:-translate-x-1': !$.get(section).enabled
						});
					},
					[
						() => `${s("settings.sections.switch") || "Enable/disable"} ${getSectionName($.get(section).id)}`
					]
				);

				$.delegated('click', button_2, () => toggleSection($.get(section).id));
				$.append($$anchor, button_2);
			};

			$.if(node, ($$render) => {
				if ($.get(section).id === "sources") $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_4);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(div_6, 'aria-label', `Drag to reorder ${$0 ?? ''} section`);
				$.set_text(text_3, $1);
			},
			[
				() => getSectionName($.get(section).id),
				() => getSectionName($.get(section).id)
			]
		);

		$.animation(div_4, () => flip, () => ({ duration: flipDurationMs }));
		$.append($$anchor, div_4);
	});

	$.reset(div_3);

	$.action(div_3, ($$node, $$action_arg) => dragHandleZone?.($$node, $$action_arg), () => ({
		items: $.get(sectionItems),
		flipDurationMs,
		type: "section",
		delayTouchStart: true,
		dropTargetStyle: {
			outline: "rgba(59, 130, 246, 0.5) solid 2px",
			outlineOffset: "-1px",
			borderRadius: "0.5rem"
		}
	}));

	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var node_2 = $.child(div_8);

	{
		var consequent_1 = ($$anchor) => {
			var span_2 = root_4();
			var text_4 = $.sibling($.child(span_2));

			$.reset(span_2);
			$.template_effect(($0) => $.set_text(text_4, ` ${$0 ?? ''}`), [() => s("settings.sections.orderReset") || "Order reset!"]);
			$.append($$anchor, span_2);
		};

		var alternate_1 = ($$anchor) => {
			var button_3 = root_5();
			var text_5 = $.only_child(button_3, true);

			$.template_effect(
				($0, $1) => {
					$.set_attribute(button_3, 'aria-label', $0);
					$.set_text(text_5, $1);
				},
				[
					() => s("settings.sections.resetOrder.aria") || "Reset all sections to default order and visibility",
					() => s("settings.sections.resetOrder") || "Reset to Default Order"
				]
			);

			$.delegated('click', button_3, resetToDefaults);
			$.append($$anchor, button_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(showResetConfirmation)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_8);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_attribute(button, 'aria-label', $2);
			$.set_text(text_2, $3);
		},
		[
			() => s("settings.sections.title") || "Article Sections",
			() => s("settings.sections.instructions") || "Drag to reorder sections. Toggle to enable/disable.",
			() => s("settings.sections.toggleAll.aria") || "Toggle all article sections on or off",
			() => s("settings.sections.toggleAll") || "Toggle All"
		]
	);

	$.delegated('click', button, () => $.get(sectionItems).map((section) => sections.toggleSection(section.id)));
	$.event('consider', div_3, handleConsider);
	$.event('finalize', div_3, handleFinalize);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);