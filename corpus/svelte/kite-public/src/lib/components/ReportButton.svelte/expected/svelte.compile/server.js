import * as $ from 'svelte/internal/server';
import { IconAlertTriangle, IconLoader2, IconPlus, IconX } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import BaseModal from './BaseModal.svelte';

export default function ReportButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { clusterId, title, class: className = '' } = $$props;
		let showModal = false;
		let issueType = '';
		let description = '';
		let sourceUrls = [''];
		let isSubmitting = false;
		let isSuccess = false;
		let errorMessage = '';
		let successMessage = '';
		let reportId = '';
		const MAX_DESCRIPTION_LENGTH = 1000;

		function openModal() {
			showModal = true;
			issueType = '';
			description = '';
			sourceUrls = [''];
			isSuccess = false;
			errorMessage = '';
			successMessage = '';
			reportId = '';
		}

		function closeModal() {
			showModal = false;
			issueType = '';
			description = '';
			sourceUrls = [''];
			isSuccess = false;
			errorMessage = '';
			successMessage = '';
			reportId = '';
			isSubmitting = false;
		}

		function addSourceField() {
			sourceUrls = [...sourceUrls, ''];
		}

		function removeSourceField(index) {
			sourceUrls = sourceUrls.filter((_, i) => i !== index);
		}

		function updateSourceUrl(index, value) {
			sourceUrls[index] = value;
		}

		async function handleSubmit() {
			if (!browser || isSubmitting || !description.trim() || !issueType) return;

			if (description.length > MAX_DESCRIPTION_LENGTH) {
				errorMessage = s('article.reportModal.characterCount', {
					count: description.length.toString(),
					max: MAX_DESCRIPTION_LENGTH.toString()
				});

				return;
			}

			// Validate source URLs
			const validSourceUrls = [];

			for (const url of sourceUrls) {
				const trimmedUrl = url.trim();

				if (trimmedUrl) {
					try {
						new URL(trimmedUrl);
						validSourceUrls.push(trimmedUrl);
					} catch {
						errorMessage = `Invalid URL: ${trimmedUrl}`;

						return;
					}
				}
			}

			isSubmitting = true;
			errorMessage = '';

			try {
				const response = await fetch('/api/reports', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						clusterId,
						issueType,
						description: description.trim(),
						sourceUrls: validSourceUrls
					})
				});

				if (!response.ok) {
					const error = await response.json();

					throw new Error(error.message || s('article.reportModal.error'));
				}

				const result = await response.json();

				reportId = result.id;
				successMessage = s('article.reportModal.success');
				isSuccess = true;

				// Don't close modal - keep it open to show success message
			} catch(error) {
				console.error('Failed to submit report:', error);
				errorMessage = error instanceof Error ? error.message : s('article.reportModal.error');
			} finally {
				isSubmitting = false;
			}
		}

		function handleKeydown(event) {
			if (event.key === 'Escape' && !isSubmitting) {
				closeModal();
			}
		}

		$$renderer.push(`<button${$.attr_class(`group relative flex h-10 w-10 items-center justify-center rounded-lg ${$.stringify(className)}`, 'svelte-1srbl82')}${$.attr('aria-label', s("article.reportInaccuracy"))}${$.attr('title', s("article.reportInaccuracy"))}>`);

		IconAlertTriangle($$renderer, {
			size: 20,
			stroke: 2,
			class: 'transition-colors text-gray-600 group-hover:text-amber-600 dark:text-gray-400 dark:group-hover:text-amber-500'
		});

		$$renderer.push(`<!----></button> `);

		BaseModal($$renderer, {
			isOpen: showModal,
			onClose: closeModal,
			title: s("article.reportModal.title"),
			size: 'md',
			closeOnEscape: !isSubmitting && !isSuccess,
			closeOnBackdrop: !isSubmitting && !isSuccess,
			children: ($$renderer) => {
				$$renderer.push(`<div class="p-4 sm:p-6 space-y-4"><p class="text-sm text-gray-600 dark:text-gray-400 -mt-2">${$.escape(s("article.reportModal.subtitle"))}</p> <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("article.reportModal.reportingFor"))}</p> <p class="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">${$.escape(title)}</p></div> <div><fieldset><legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${$.escape(s("article.reportModal.issueType"))}</legend> <div class="space-y-2"><label class="flex items-center"><input type="radio" name="issueType" value="factualError"${$.attr('checked', issueType === 'factualError', true)}${$.attr('disabled', isSubmitting || isSuccess, true)} class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300">${$.escape(s("article.reportModal.issueType.factualError"))}</span></label> <label class="flex items-center"><input type="radio" name="issueType" value="misleading"${$.attr('checked', issueType === 'misleading', true)}${$.attr('disabled', isSubmitting || isSuccess, true)} class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300">${$.escape(s("article.reportModal.issueType.misleading"))}</span></label> <label class="flex items-center"><input type="radio" name="issueType" value="outdated"${$.attr('checked', issueType === 'outdated', true)}${$.attr('disabled', isSubmitting || isSuccess, true)} class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300">${$.escape(s("article.reportModal.issueType.outdated"))}</span></label> <label class="flex items-center"><input type="radio" name="issueType" value="other"${$.attr('checked', issueType === 'other', true)}${$.attr('disabled', isSubmitting || isSuccess, true)} class="me-2 text-amber-600 focus:ring-amber-500"/> <span class="text-sm text-gray-700 dark:text-gray-300">${$.escape(s("article.reportModal.issueType.other"))}</span></label></div></fieldset></div> <div><label for="report-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${$.escape(s("article.reportModal.description"))}</label> <textarea id="report-description"${$.attr('disabled', isSubmitting || isSuccess, true)}${$.attr('placeholder', s("article.reportModal.descriptionPlaceholder"))} class="w-full h-[180px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"${$.attr('maxlength', MAX_DESCRIPTION_LENGTH)}>`);

				const $$body = $.escape(description);

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea> <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>${$.escape(s("article.reportModal.characterCount", {
					count: description.length.toString(),
					max: MAX_DESCRIPTION_LENGTH.toString()
				}))}</span></div></div> <fieldset><div class="mb-2"><legend class="block text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("article.reportModal.source"))}</legend> <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("article.reportModal.sourceHelper"))}</p></div> <div class="space-y-2"><!--[-->`);

				const each_array = $.ensure_array_like(sourceUrls);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let sourceUrl = each_array[index];

					$$renderer.push(`<div class="flex gap-2"><input type="url"${$.attr('value', sourceUrl)}${$.attr('disabled', isSubmitting || isSuccess, true)}${$.attr('placeholder', s("article.reportModal.sourcePlaceholder"))} class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"/> `);

					if (sourceUrls.length > 1) {
						$$renderer.push(`<!--[0--><button type="button"${$.attr('disabled', isSubmitting || isSuccess, true)} class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82" aria-label="Remove source">`);
						IconX($$renderer, { size: 20, stroke: 2 });
						$$renderer.push(`<!----></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--> `);

				if (sourceUrls.length < 5) {
					$$renderer.push(`<!--[0--><button type="button"${$.attr('disabled', isSubmitting || isSuccess, true)} class="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82">`);
					IconPlus($$renderer, { size: 16, stroke: 2 });
					$$renderer.push(`<!----> ${$.escape(s("article.reportModal.addSource"))}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></fieldset> `);

				if (errorMessage) {
					$$renderer.push(`<!--[0--><div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p class="text-sm text-red-600 dark:text-red-400">${$.escape(errorMessage)}</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (successMessage) {
					$$renderer.push(`<!--[0--><div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"><p class="text-sm text-green-600 dark:text-green-400">${$.escape(successMessage)}</p> `);

					if (reportId) {
						$$renderer.push(`<!--[0--><p class="text-xs text-green-600 dark:text-green-400 mt-1">${$.escape(s("article.reportModal.reportId", { id: reportId }))}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex justify-end gap-3 pt-2"><button${$.attr('disabled', isSubmitting || isSuccess, true)} class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed svelte-1srbl82">${$.escape(s("article.reportModal.cancel"))}</button> <button${$.attr('disabled', isSubmitting || !description.trim() || !issueType || isSuccess, true)} class="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 svelte-1srbl82">`);

				if (isSubmitting) {
					$$renderer.push('<!--[0-->');
					IconLoader2($$renderer, { size: 16, stroke: 2, class: 'animate-spin' });
					$$renderer.push(`<!----> ${$.escape(s("article.reportModal.submitting"))}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(s("article.reportModal.submit"))}`);
				}

				$$renderer.push(`<!--]--></button></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}