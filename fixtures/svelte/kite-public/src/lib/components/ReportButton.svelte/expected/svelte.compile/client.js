import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconAlertTriangle, IconLoader2, IconPlus, IconX } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import BaseModal from './BaseModal.svelte';

var root = $.from_html(`<button type="button" class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82" aria-label="Remove source"><!></button>`);
var root_1 = $.from_html(`<div class="flex gap-2"><input type="url" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"/> <!></div>`);
var root_2 = $.from_html(`<button type="button" class="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82"><!> </button>`);
var root_3 = $.from_html(`<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p class="text-sm text-red-600 dark:text-red-400"> </p></div>`);
var root_4 = $.from_html(`<p class="text-xs text-green-600 dark:text-green-400 mt-1"> </p>`);
var root_5 = $.from_html(`<div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"><p class="text-sm text-green-600 dark:text-green-400"> </p> <!></div>`);
var root_6 = $.from_html(`<!> `, 1);
var root_7 = $.from_html(`<div class="p-4 sm:p-6 space-y-4"><p class="text-sm text-gray-600 dark:text-gray-400 -mt-2"> </p> <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p class="text-sm text-gray-600 dark:text-gray-400"> </p> <p class="font-medium text-gray-900 dark:text-gray-100 line-clamp-2"> </p></div> <div><fieldset><legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> </legend> <div class="space-y-2"><label class="flex items-center"><input type="radio" name="issueType" class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300"> </span></label> <label class="flex items-center"><input type="radio" name="issueType" class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300"> </span></label> <label class="flex items-center"><input type="radio" name="issueType" class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300"> </span></label> <label class="flex items-center"><input type="radio" name="issueType" class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300"> </span></label></div></fieldset></div> <div><label for="report-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> </label> <textarea id="report-description" class="w-full h-[180px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"></textarea> <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400"><span> </span></div></div> <fieldset><div class="mb-2"><legend class="block text-sm font-medium text-gray-700 dark:text-gray-300"> </legend> <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="space-y-2"><!> <!></div></fieldset> <!> <!> <div class="flex justify-end gap-3 pt-2"><button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82"> </button> <button class="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 svelte-1srbl82"><!></button></div></div>`);
var root_8 = $.from_html(`<button><!></button> <!>`, 1);

export default function ReportButton($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let className = $.prop($$props, 'class', 3, '');
	let showModal = $.state(false);
	let issueType = $.state('');
	let description = $.state('');
	let sourceUrls = $.state($.proxy(['']));
	let isSubmitting = $.state(false);
	let isSuccess = $.state(false);
	let errorMessage = $.state('');
	let successMessage = $.state('');
	let reportId = $.state('');
	const MAX_DESCRIPTION_LENGTH = 1000;

	function openModal() {
		$.set(showModal, true);
		$.set(issueType, '');
		$.set(description, '');
		$.set(sourceUrls, [''], true);
		$.set(isSuccess, false);
		$.set(errorMessage, '');
		$.set(successMessage, '');
		$.set(reportId, '');
	}

	function closeModal() {
		$.set(showModal, false);
		$.set(issueType, '');
		$.set(description, '');
		$.set(sourceUrls, [''], true);
		$.set(isSuccess, false);
		$.set(errorMessage, '');
		$.set(successMessage, '');
		$.set(reportId, '');
		$.set(isSubmitting, false);
	}

	function addSourceField() {
		$.set(sourceUrls, [...$.get(sourceUrls), ''], true);
	}

	function removeSourceField(index) {
		$.set(sourceUrls, $.get(sourceUrls).filter((_, i) => i !== index), true);
	}

	function updateSourceUrl(index, value) {
		$.get(sourceUrls)[index] = value;
	}

	async function handleSubmit() {
		if (!browser || $.get(isSubmitting) || !$.get(description).trim() || !$.get(issueType)) return;

		if ($.get(description).length > MAX_DESCRIPTION_LENGTH) {
			$.set(
				errorMessage,
				s('article.reportModal.characterCount', {
					count: $.get(description).length.toString(),
					max: MAX_DESCRIPTION_LENGTH.toString()
				}),
				true
			);

			return;
		}

		// Validate source URLs
		const validSourceUrls = [];

		for (const url of $.get(sourceUrls)) {
			const trimmedUrl = url.trim();

			if (trimmedUrl) {
				try {
					new URL(trimmedUrl);
					validSourceUrls.push(trimmedUrl);
				} catch {
					$.set(errorMessage, `Invalid URL: ${trimmedUrl}`);

					return;
				}
			}
		}

		$.set(isSubmitting, true);
		$.set(errorMessage, '');

		try {
			const response = await fetch('/api/reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					clusterId: $$props.clusterId,
					issueType: $.get(issueType),
					description: $.get(description).trim(),
					sourceUrls: validSourceUrls
				})
			});

			if (!response.ok) {
				const error = await response.json();

				throw new Error(error.message || s('article.reportModal.error'));
			}

			const result = await response.json();

			$.set(reportId, result.id, true);
			$.set(successMessage, s('article.reportModal.success'), true);
			$.set(isSuccess, true);

			// Don't close modal - keep it open to show success message
		} catch(error) {
			console.error('Failed to submit report:', error);
			$.set(errorMessage, error instanceof Error ? error.message : s('article.reportModal.error'), true);
		} finally {
			$.set(isSubmitting, false);
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && !$.get(isSubmitting)) {
			closeModal();
		}
	}

	var fragment = root_8();
	var button = $.first_child(fragment);
	var node = $.child(button);

	IconAlertTriangle(node, {
		size: 20,
		stroke: 2,
		class: 'transition-colors text-gray-600 group-hover:text-amber-600 dark:text-gray-400 dark:group-hover:text-amber-500'
	});

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		let $0 = $.derived(() => s("article.reportModal.title"));
		let $1 = $.derived(() => !$.get(isSubmitting) && !$.get(isSuccess));
		let $2 = $.derived(() => !$.get(isSubmitting) && !$.get(isSuccess));

		BaseModal(node_1, {
			get isOpen() {
				return $.get(showModal);
			},
			onClose: closeModal,
			get title() {
				return $.get($0);
			},
			size: 'md',
			get closeOnEscape() {
				return $.get($1);
			},

			get closeOnBackdrop() {
				return $.get($2);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_7();
				var p = $.child(div);
				var text = $.only_child(p, true);
				var div_1 = $.sibling(p, 2);
				var p_1 = $.child(div_1);
				var text_1 = $.only_child(p_1, true);
				var p_2 = $.sibling(p_1, 2);
				var text_2 = $.only_child(p_2, true);

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var fieldset = $.child(div_2);
				var legend = $.child(fieldset);
				var text_3 = $.only_child(legend, true);
				var div_3 = $.sibling(legend, 2);
				var label = $.child(div_3);
				var input = $.child(label);

				$.remove_input_defaults(input);
				input.value = input.__value = 'factualError';

				var span = $.sibling(input, 2);
				var text_4 = $.only_child(span, true);

				$.reset(label);

				var label_1 = $.sibling(label, 2);
				var input_1 = $.child(label_1);

				$.remove_input_defaults(input_1);
				input_1.value = input_1.__value = 'misleading';

				var span_1 = $.sibling(input_1, 2);
				var text_5 = $.only_child(span_1, true);

				$.reset(label_1);

				var label_2 = $.sibling(label_1, 2);
				var input_2 = $.child(label_2);

				$.remove_input_defaults(input_2);
				input_2.value = input_2.__value = 'outdated';

				var span_2 = $.sibling(input_2, 2);
				var text_6 = $.only_child(span_2, true);

				$.reset(label_2);

				var label_3 = $.sibling(label_2, 2);
				var input_3 = $.child(label_3);

				$.remove_input_defaults(input_3);
				input_3.value = input_3.__value = 'other';

				var span_3 = $.sibling(input_3, 2);
				var text_7 = $.only_child(span_3, true);

				$.reset(label_3);
				$.reset(div_3);
				$.reset(fieldset);
				$.reset(div_2);

				var div_4 = $.sibling(div_2, 2);
				var label_4 = $.child(div_4);
				var text_8 = $.only_child(label_4, true);
				var textarea = $.sibling(label_4, 2);

				$.remove_textarea_child(textarea);
				$.set_attribute(textarea, 'maxlength', MAX_DESCRIPTION_LENGTH);

				var div_5 = $.sibling(textarea, 2);
				var span_4 = $.child(div_5);
				var text_9 = $.only_child(span_4, true);

				$.reset(div_5);
				$.reset(div_4);

				var fieldset_1 = $.sibling(div_4, 2);
				var div_6 = $.child(fieldset_1);
				var legend_1 = $.child(div_6);
				var text_10 = $.only_child(legend_1, true);
				var p_3 = $.sibling(legend_1, 2);
				var text_11 = $.only_child(p_3, true);

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var node_2 = $.child(div_7);

				$.each(node_2, 17, () => $.get(sourceUrls), $.index, ($$anchor, sourceUrl, index) => {
					var div_8 = root_1();
					var input_4 = $.child(div_8);

					$.remove_input_defaults(input_4);

					var node_3 = $.sibling(input_4, 2);

					{
						var consequent = ($$anchor) => {
							var button_1 = root();
							var node_4 = $.child(button_1);

							IconX(node_4, { size: 20, stroke: 2 });
							$.reset(button_1);
							$.template_effect(() => button_1.disabled = $.get(isSubmitting) || $.get(isSuccess));
							$.delegated('click', button_1, () => removeSourceField(index));
							$.append($$anchor, button_1);
						};

						$.if(node_3, ($$render) => {
							if ($.get(sourceUrls).length > 1) $$render(consequent);
						});
					}

					$.reset(div_8);

					$.template_effect(
						($0) => {
							$.set_value(input_4, $.get(sourceUrl));
							input_4.disabled = $.get(isSubmitting) || $.get(isSuccess);
							$.set_attribute(input_4, 'placeholder', $0);
						},
						[() => s("article.reportModal.sourcePlaceholder")]
					);

					$.delegated('input', input_4, (e) => updateSourceUrl(index, e.currentTarget.value));
					$.delegated('keydown', input_4, handleKeydown);
					$.append($$anchor, div_8);
				});

				var node_5 = $.sibling(node_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var button_2 = root_2();
						var node_6 = $.child(button_2);

						IconPlus(node_6, { size: 16, stroke: 2 });

						var text_12 = $.sibling(node_6);

						$.reset(button_2);

						$.template_effect(
							($0) => {
								button_2.disabled = $.get(isSubmitting) || $.get(isSuccess);
								$.set_text(text_12, ` ${$0 ?? ''}`);
							},
							[() => s("article.reportModal.addSource")]
						);

						$.delegated('click', button_2, addSourceField);
						$.append($$anchor, button_2);
					};

					$.if(node_5, ($$render) => {
						if ($.get(sourceUrls).length < 5) $$render(consequent_1);
					});
				}

				$.reset(div_7);
				$.reset(fieldset_1);

				var node_7 = $.sibling(fieldset_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_9 = root_3();
						var p_4 = $.child(div_9);
						var text_13 = $.only_child(p_4, true);

						$.reset(div_9);
						$.template_effect(() => $.set_text(text_13, $.get(errorMessage)));
						$.append($$anchor, div_9);
					};

					$.if(node_7, ($$render) => {
						if ($.get(errorMessage)) $$render(consequent_2);
					});
				}

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent_4 = ($$anchor) => {
						var div_10 = root_5();
						var p_5 = $.child(div_10);
						var text_14 = $.only_child(p_5, true);
						var node_9 = $.sibling(p_5, 2);

						{
							var consequent_3 = ($$anchor) => {
								var p_6 = root_4();
								var text_15 = $.only_child(p_6, true);

								$.template_effect(($0) => $.set_text(text_15, $0), [
									() => s("article.reportModal.reportId", { id: $.get(reportId) })
								]);

								$.append($$anchor, p_6);
							};

							$.if(node_9, ($$render) => {
								if ($.get(reportId)) $$render(consequent_3);
							});
						}

						$.reset(div_10);
						$.template_effect(() => $.set_text(text_14, $.get(successMessage)));
						$.append($$anchor, div_10);
					};

					$.if(node_8, ($$render) => {
						if ($.get(successMessage)) $$render(consequent_4);
					});
				}

				var div_11 = $.sibling(node_8, 2);
				var button_3 = $.child(div_11);
				var text_16 = $.only_child(button_3, true);
				var button_4 = $.sibling(button_3, 2);
				var node_10 = $.child(button_4);

				{
					var consequent_5 = ($$anchor) => {
						var fragment_1 = root_6();
						var node_11 = $.first_child(fragment_1);

						IconLoader2(node_11, { size: 16, stroke: 2, class: 'animate-spin' });

						var text_17 = $.sibling(node_11);

						$.template_effect(($0) => $.set_text(text_17, ` ${$0 ?? ''}`), [() => s("article.reportModal.submitting")]);
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var text_18 = $.text();

						$.template_effect(($0) => $.set_text(text_18, $0), [() => s("article.reportModal.submit")]);
						$.append($$anchor, text_18);
					};

					$.if(node_10, ($$render) => {
						if ($.get(isSubmitting)) $$render(consequent_5); else $$render(alternate, -1);
					});
				}

				$.reset(button_4);
				$.reset(div_11);
				$.reset(div);

				$.template_effect(
					($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
						$.set_text(text, $0);
						$.set_text(text_1, $1);
						$.set_text(text_2, $$props.title);
						$.set_text(text_3, $2);
						input.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_text(text_4, $3);
						input_1.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_text(text_5, $4);
						input_2.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_text(text_6, $5);
						input_3.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_text(text_7, $6);
						$.set_text(text_8, $7);
						textarea.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_attribute(textarea, 'placeholder', $8);
						$.set_text(text_9, $9);
						$.set_text(text_10, $10);
						$.set_text(text_11, $11);
						button_3.disabled = $.get(isSubmitting) || $.get(isSuccess);
						$.set_text(text_16, $12);
						button_4.disabled = $13;
					},
					[
						() => s("article.reportModal.subtitle"),
						() => s("article.reportModal.reportingFor"),
						() => s("article.reportModal.issueType"),
						() => s("article.reportModal.issueType.factualError"),
						() => s("article.reportModal.issueType.misleading"),
						() => s("article.reportModal.issueType.outdated"),
						() => s("article.reportModal.issueType.other"),
						() => s("article.reportModal.description"),
						() => s("article.reportModal.descriptionPlaceholder"),
						() => s("article.reportModal.characterCount", {
							count: $.get(description).length.toString(),
							max: MAX_DESCRIPTION_LENGTH.toString()
						}),
						() => s("article.reportModal.source"),
						() => s("article.reportModal.sourceHelper"),
						() => s("article.reportModal.cancel"),
						() => $.get(isSubmitting) || !$.get(description).trim() || !$.get(issueType) || $.get(isSuccess)
					]
				);

				$.bind_group(binding_group, [], input, () => $.get(issueType), ($$value) => $.set(issueType, $$value));
				$.bind_group(binding_group, [], input_1, () => $.get(issueType), ($$value) => $.set(issueType, $$value));
				$.bind_group(binding_group, [], input_2, () => $.get(issueType), ($$value) => $.set(issueType, $$value));
				$.bind_group(binding_group, [], input_3, () => $.get(issueType), ($$value) => $.set(issueType, $$value));
				$.delegated('keydown', textarea, handleKeydown);
				$.bind_value(textarea, () => $.get(description), ($$value) => $.set(description, $$value));
				$.delegated('click', button_3, closeModal);
				$.delegated('click', button_4, handleSubmit);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(
		($0, $1) => {
			$.set_class(button, 1, `group relative flex h-10 w-10 items-center justify-center rounded-lg ${className() ?? ''}`, 'svelte-1srbl82');
			$.set_attribute(button, 'aria-label', $0);
			$.set_attribute(button, 'title', $1);
		},
		[
			() => s("article.reportInaccuracy"),
			() => s("article.reportInaccuracy")
		]
	);

	$.delegated('click', button, openModal);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'input']);