import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { dragHandle, dragHandleZone } from 'svelte-dnd-action';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { sections } from '$lib/stores/sections.svelte.js';

export default function SectionsList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { showHeader = true, showResetButton = true } = $$props;

		// Sections State
		let sectionItems = [];

		const flipDurationMs = 200;
		let showResetConfirmation = false;

		// Initialize sections when store changes
		function handleSectionConsider(e) {
			sectionItems = e.detail.items;
		}

		function handleSectionFinalize(e) {
			sectionItems = e.detail.items;
			updateSectionOrder();
		}

		function updateSectionOrder() {
			sectionItems.forEach((section, index) => {
				sections.setOrder(section.id, index + 1);
			});
		}

		function toggleSection(sectionId) {
			sections.toggleSection(sectionId);
		}

		function resetToDefaults() {
			sections.reset();
			showResetConfirmation = true;

			setTimeout(
				() => {
					showResetConfirmation = false;
				},
				1000
			);
		}

		function getSectionName(id) {
			const key = `section.${id}`;

			return s(key) || id.charAt(0).toUpperCase() + id.slice(1);
		}

		$$renderer.push(`<div class="space-y-4">`);

		if (showHeader) {
			$$renderer.push(`<!--[0--><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.sections.title") || "Article Sections")}</h3>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class('', void 0, { 'ps-2': showHeader })}><div class="mb-3 flex justify-between items-center"><p class="text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.sections.instructions") || "Drag to reorder sections. Toggle to enable/disable.")}</p> <button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 me-2 focus-visible-ring rounded"${$.attr('aria-label', s("settings.sections.toggleAll.aria") || "Toggle all article sections on or off")}>${$.escape(s("settings.sections.toggleAll") || "Toggle All")}</button></div> <div class="space-y-2"><!--[-->`);

		const each_array = $.ensure_array_like(sectionItems);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let section = each_array[$$index];

			$$renderer.push(`<div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"><div class="flex items-center gap-4"><div role="button" tabindex="0" class="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-manipulation focus-visible-ring rounded p-1"${$.attr('aria-label', s("settings.sections.dragHandle.aria") || `Reorder ${getSectionName(section.id)} section. Press Enter to grab, arrow keys to move, Enter to drop.`)} aria-roledescription="sortable"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="4" r="1"></circle><circle cx="3" cy="8" r="1"></circle><circle cx="3" cy="12" r="1"></circle><circle cx="8" cy="4" r="1"></circle><circle cx="8" cy="8" r="1"></circle><circle cx="8" cy="12" r="1"></circle></svg></div> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(getSectionName(section.id))}</span></div> `);

			if (section.id === "sources") {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

				Tooltip($$renderer, {
					text: s("settings.sections.sourcesRequired") || "Sources are always shown to maintain transparency and credibility",
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<button class="focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600 opacity-60 cursor-not-allowed" role="switch"${$.attr('aria-checked', true)}${$.attr('aria-label', `${getSectionName(section.id)} (always enabled)`)} disabled=""><span class="inline-block h-4 w-4 transform rounded-full bg-white transition ltr:translate-x-6 rtl:-translate-x-6"></span></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><button${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors', void 0, {
					'bg-blue-600': section.enabled,
					'bg-gray-200': !section.enabled,
					'dark:bg-gray-600': !section.enabled
				})} role="switch"${$.attr('aria-checked', section.enabled)}${$.attr('aria-label', `${s("settings.sections.switch") || "Enable/disable"} ${getSectionName(section.id)}`)}><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
					'ltr:translate-x-6': section.enabled,
					'rtl:-translate-x-6': section.enabled,
					'ltr:translate-x-1': !section.enabled,
					'rtl:-translate-x-1': !section.enabled
				})}></span></button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (showResetButton) {
			$$renderer.push(`<!--[0--><div class="text-center mt-4">`);

			if (showResetConfirmation) {
				$$renderer.push(`<!--[0--><span class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="inline-block"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path></svg> ${$.escape(s("settings.sections.orderReset") || "Order reset!")}</span>`);
			} else {
				$$renderer.push(`<!--[-1--><button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded"${$.attr('aria-label', s("settings.sections.resetOrder.aria") || "Reset all sections to default order and visibility")}>${$.escape(s("settings.sections.resetOrder") || "Reset to Default Order")}</button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}