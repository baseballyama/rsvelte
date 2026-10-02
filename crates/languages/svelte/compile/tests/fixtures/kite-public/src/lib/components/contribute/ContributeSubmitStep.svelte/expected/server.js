import * as $ from 'svelte/internal/server';

import {
	IconBrandGithub,
	IconCheck,
	IconCircleCheck,
	IconCircleX,
	IconClipboard,
	IconExternalLink,
	IconLoader2,
	IconSend
} from '@tabler/icons-svelte';

import { s } from '$lib/client/localization.svelte';
import { copyToClipboard } from '$lib/utils/feedContribution';

export default function ContributeSubmitStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			submitResult,
			isSubmitting,
			canSubmit,
			allErrored,
			mode,
			githubMode,
			activeCategoryName,
			submittableFeeds,
			errorFeeds,
			pendingFeeds,
			onSubmit,
			onReset
		} = $$props;

		let copied = false;

		async function handleCopy(text) {
			const ok = await copyToClipboard(text);

			if (ok) {
				copied = true;

				setTimeout(
					() => {
						copied = false;
					},
					2000
				);
			}
		}

		$$renderer.push(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4">${$.escape(s('contribute.step3'))}</h2> `);

		if (submitResult?.type === 'success') {
			$$renderer.push(`<!--[0--><div role="alert" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"><div class="flex items-start gap-2">`);

			IconCircleCheck($$renderer, {
				size: 20,
				class: 'shrink-0 text-green-600 dark:text-green-400'
			});

			$$renderer.push(`<!----> <div><p class="text-sm font-medium text-green-800 dark:text-green-200">${$.escape(submitResult.message)}</p> `);

			if (submitResult.prUrl) {
				$$renderer.push(`<!--[0--><a${$.attr('href', submitResult.prUrl)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-2 text-sm text-green-700 dark:text-green-300 hover:underline">`);
				IconBrandGithub($$renderer, { size: 16 });
				$$renderer.push(`<!----> ${$.escape(s('contribute.viewPr'))} `);
				IconExternalLink($$renderer, { size: 14 });
				$$renderer.push(`<!----></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="mt-2 text-xs text-green-700/70 dark:text-green-300/70">${$.escape(s('contribute.reviewNote'))}</p> <button class="block mt-3 text-sm text-accent-links hover:underline">${$.escape(s('contribute.submitAnother'))}</button></div></div></div>`);
		} else if (submitResult?.type === 'manual' && submitResult.snippet) {
			$$renderer.push('<!--[1-->');

			const snippet = submitResult.snippet;

			$$renderer.push(`<div class="space-y-4"><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"><p class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">${$.escape(s('contribute.manual.instructions'))}</p> <ol class="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">`);

			if (snippet.isFullFile) {
				$$renderer.push(`<!--[0--><li>${$.escape(s('contribute.manual.step1Full'))}</li> <li>${$.escape(s('contribute.manual.step2Full', { fileName: snippet.fileName }))}</li>`);
			} else {
				$$renderer.push(`<!--[-1--><li>${$.escape(s('contribute.manual.step1'))}</li> `);

				if (snippet.isNew) {
					$$renderer.push(`<!--[0--><li>${$.escape(s('contribute.manual.step2New', { fileName: snippet.fileName }))}</li>`);
				} else {
					$$renderer.push(`<!--[-1--><li>${$.escape(s('contribute.manual.step2Existing', { category: activeCategoryName, fileName: snippet.fileName }))}</li>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> <li>${$.escape(s('contribute.manual.step3'))}</li></ol></div> <div class="relative"><div class="flex items-center justify-between mb-1.5"><span class="text-xs font-medium text-primary-400">`);

			if (snippet.isFullFile) {
				$$renderer.push(`<!--[0-->${$.escape(s('contribute.manual.fullFile', { fileName: snippet.fileName }))}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(s('contribute.manual.addTo', { fileName: snippet.fileName }))}`);
			}

			$$renderer.push(`<!--]--></span> <button class="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-600 transition-colors">`);

			if (copied) {
				$$renderer.push('<!--[0-->');
				IconCheck($$renderer, { size: 14, class: 'text-green-500' });
				$$renderer.push(`<!----> ${$.escape(s('contribute.manual.copied'))}`);
			} else {
				$$renderer.push('<!--[-1-->');
				IconClipboard($$renderer, { size: 14 });
				$$renderer.push(`<!----> ${$.escape(s('contribute.manual.copy'))}`);
			}

			$$renderer.push(`<!--]--></button></div> <pre class="bg-primary-100 dark:bg-primary-800 border border-primary-200 rounded-lg p-3 text-xs text-primary font-mono overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all max-h-96">${$.escape(snippet.content)}</pre></div> <a${$.attr('href', snippet.editUrl)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors bg-[#24292f] hover:bg-[#32383f] text-white">`);
			IconBrandGithub($$renderer, { size: 16 });
			$$renderer.push(`<!----> ${$.escape(s('contribute.manual.editOnGithub', { fileName: snippet.fileName }))} `);
			IconExternalLink($$renderer, { size: 14 });
			$$renderer.push(`<!----></a> <button class="block text-sm text-accent-links hover:underline">${$.escape(s('contribute.submitAnother'))}</button></div>`);
		} else if (submitResult?.type === 'error') {
			$$renderer.push(`<!--[2--><div role="alert" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"><div class="flex items-start gap-2">`);
			IconCircleX($$renderer, { size: 20, class: 'shrink-0 text-red-600 dark:text-red-400' });
			$$renderer.push(`<!----> <p class="text-sm text-red-800 dark:text-red-200">${$.escape(submitResult.message)}</p></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!submitResult || submitResult.type === 'error') {
			$$renderer.push(`<!--[0--><div class="text-sm text-primary-600 mb-4">`);

			if (mode === 'new') {
				$$renderer.push(`<!--[0-->${$.escape(s('contribute.summaryNew', {
					category: activeCategoryName,
					count: String(submittableFeeds.length)
				}))}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(s('contribute.summaryExisting', {
					count: String(submittableFeeds.length),
					category: activeCategoryName
				}))}`);
			}

			$$renderer.push(`<!--]--> `);

			if (errorFeeds.length > 0 && submittableFeeds.length > 0) {
				$$renderer.push(`<!--[0--><span class="text-xs text-primary-400">${$.escape(s('contribute.excludedNote', { count: String(errorFeeds.length) }))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-wrap gap-3"><button${$.attr('disabled', !canSubmit || isSubmitting, true)} class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-primary-300 text-white disabled:text-primary-400">`);

			if (isSubmitting) {
				$$renderer.push('<!--[0-->');
				IconLoader2($$renderer, { size: 16, class: 'animate-spin' });
				$$renderer.push(`<!----> ${$.escape(s('contribute.creatingPr'))}`);
			} else if (githubMode === 'manual') {
				$$renderer.push('<!--[1-->');
				IconBrandGithub($$renderer, { size: 16 });
				$$renderer.push(`<!----> ${$.escape(s('contribute.manual.submit'))}`);
			} else {
				$$renderer.push('<!--[-1-->');
				IconSend($$renderer, { size: 16 });
				$$renderer.push(`<!----> ${$.escape(s('contribute.createPr'))}`);
			}

			$$renderer.push(`<!--]--></button></div> `);

			if (pendingFeeds.length > 0) {
				$$renderer.push(`<!--[0--><p class="mt-2 text-xs text-primary-600">${$.escape(s('contribute.waitingValidation', { count: String(pendingFeeds.length) }))}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (allErrored) {
				$$renderer.push(`<!--[0--><p class="mt-2 text-xs text-red-600 dark:text-red-400">${$.escape(s('contribute.cannotSubmit'))}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}