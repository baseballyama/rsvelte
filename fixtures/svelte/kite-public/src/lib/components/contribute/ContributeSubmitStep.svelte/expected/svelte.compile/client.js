import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-2 text-sm text-green-700 dark:text-green-300 hover:underline"><!> <!></a>`);
var root_1 = $.from_html(`<div role="alert" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"><div class="flex items-start gap-2"><!> <div><p class="text-sm font-medium text-green-800 dark:text-green-200"> </p> <!> <p class="mt-2 text-xs text-green-700/70 dark:text-green-300/70"> </p> <button class="block mt-3 text-sm text-accent-links hover:underline"> </button></div></div></div>`);
var root_2 = $.from_html(`<li> </li> <li> </li>`, 1);
var root_3 = $.from_html(`<li> </li>`);
var root_4 = $.from_html(`<li> </li> <!>`, 1);
var root_5 = $.from_html(`<!> `, 1);

var root_6 = $.from_html(`<div class="space-y-4"><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"><p class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3"> </p> <ol class="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside"><!> <li> </li></ol></div> <div class="relative"><div class="flex items-center justify-between mb-1.5"><span class="text-xs font-medium text-primary-400"><!></span> <button class="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-600 transition-colors"><!></button></div> <pre class="bg-primary-100 dark:bg-primary-800 border border-primary-200 rounded-lg p-3 text-xs text-primary font-mono overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all max-h-96"> </pre></div> <a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
					bg-[#24292f] hover:bg-[#32383f] text-white"><!> <!></a> <button class="block text-sm text-accent-links hover:underline"> </button></div>`);

var root_7 = $.from_html(`<div role="alert" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"><div class="flex items-start gap-2"><!> <p class="text-sm text-red-800 dark:text-red-200"> </p></div></div>`);
var root_8 = $.from_html(`<span class="text-xs text-primary-400"> </span>`);
var root_9 = $.from_html(`<p class="mt-2 text-xs text-primary-600"> </p>`);
var root_10 = $.from_html(`<p class="mt-2 text-xs text-red-600 dark:text-red-400"> </p>`);

var root_11 = $.from_html(
	`<div class="text-sm text-primary-600 mb-4"><!> <!></div> <div class="flex flex-wrap gap-3"><button class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
					bg-blue-600 hover:bg-blue-700 disabled:bg-primary-300 text-white disabled:text-primary-400"><!></button></div> <!> <!>`,
	1
);

var root_12 = $.from_html(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4"> </h2> <!> <!></div>`);

export default function ContributeSubmitStep($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.state(false);

	async function handleCopy(text) {
		const ok = await copyToClipboard(text);

		if (ok) {
			$.set(copied, true);

			setTimeout(
				() => {
					$.set(copied, false);
				},
				2000
			);
		}
	}

	var div = root_12();
	var h2 = $.child(div);
	var text_1 = $.only_child(h2, true);
	var node = $.sibling(h2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			IconCircleCheck(node_1, {
				size: 20,
				class: 'shrink-0 text-green-600 dark:text-green-400'
			});

			var div_3 = $.sibling(node_1, 2);
			var p = $.child(div_3);
			var text_2 = $.only_child(p, true);
			var node_2 = $.sibling(p, 2);

			{
				var consequent = ($$anchor) => {
					var a = root();
					var node_3 = $.child(a);

					IconBrandGithub(node_3, { size: 16 });

					var text_3 = $.sibling(node_3);
					var node_4 = $.sibling(text_3);

					IconExternalLink(node_4, { size: 14 });
					$.reset(a);

					$.template_effect(
						($0) => {
							$.set_attribute(a, 'href', $$props.submitResult.prUrl);
							$.set_text(text_3, ` ${$0 ?? ''} `);
						},
						[() => s('contribute.viewPr')]
					);

					$.append($$anchor, a);
				};

				$.if(node_2, ($$render) => {
					if ($$props.submitResult.prUrl) $$render(consequent);
				});
			}

			var p_1 = $.sibling(node_2, 2);
			var text_4 = $.only_child(p_1, true);
			var button = $.sibling(p_1, 2);
			var text_5 = $.only_child(button, true);

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_2, $$props.submitResult.message);
					$.set_text(text_4, $0);
					$.set_text(text_5, $1);
				},
				[
					() => s('contribute.reviewNote'),
					() => s('contribute.submitAnother')
				]
			);

			$.delegated('click', button, function (...$$args) {
				$$props.onReset?.apply(this, $$args);
			});

			$.append($$anchor, div_1);
		};

		var consequent_6 = ($$anchor) => {
			const snippet = $.derived(() => $$props.submitResult.snippet);
			var div_4 = root_6();
			var div_5 = $.child(div_4);
			var p_2 = $.child(div_5);
			var text_6 = $.only_child(p_2, true);
			var ol = $.sibling(p_2, 2);
			var node_5 = $.child(ol);

			{
				var consequent_2 = ($$anchor) => {
					var fragment = root_2();
					var li = $.first_child(fragment);
					var text_7 = $.only_child(li, true);
					var li_1 = $.sibling(li, 2);
					var text_8 = $.only_child(li_1, true);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_7, $0);
							$.set_text(text_8, $1);
						},
						[
							() => s('contribute.manual.step1Full'),
							() => s('contribute.manual.step2Full', { fileName: $.get(snippet).fileName })
						]
					);

					$.append($$anchor, fragment);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_1 = root_4();
					var li_2 = $.first_child(fragment_1);
					var text_9 = $.only_child(li_2, true);
					var node_6 = $.sibling(li_2, 2);

					{
						var consequent_3 = ($$anchor) => {
							var li_3 = root_3();
							var text_10 = $.only_child(li_3, true);

							$.template_effect(($0) => $.set_text(text_10, $0), [
								() => s('contribute.manual.step2New', { fileName: $.get(snippet).fileName })
							]);

							$.append($$anchor, li_3);
						};

						var alternate = ($$anchor) => {
							var li_4 = root_3();
							var text_11 = $.only_child(li_4, true);

							$.template_effect(($0) => $.set_text(text_11, $0), [
								() => s('contribute.manual.step2Existing', {
									category: $$props.activeCategoryName,
									fileName: $.get(snippet).fileName
								})
							]);

							$.append($$anchor, li_4);
						};

						$.if(node_6, ($$render) => {
							if ($.get(snippet).isNew) $$render(consequent_3); else $$render(alternate, -1);
						});
					}

					$.template_effect(($0) => $.set_text(text_9, $0), [() => s('contribute.manual.step1')]);
					$.append($$anchor, fragment_1);
				};

				$.if(node_5, ($$render) => {
					if ($.get(snippet).isFullFile) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			var li_5 = $.sibling(node_5, 2);
			var text_12 = $.only_child(li_5, true);

			$.reset(ol);
			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var div_7 = $.child(div_6);
			var span = $.child(div_7);
			var node_7 = $.child(span);

			{
				var consequent_4 = ($$anchor) => {
					var text_13 = $.text();

					$.template_effect(($0) => $.set_text(text_13, $0), [
						() => s('contribute.manual.fullFile', { fileName: $.get(snippet).fileName })
					]);

					$.append($$anchor, text_13);
				};

				var alternate_2 = ($$anchor) => {
					var text_14 = $.text();

					$.template_effect(($0) => $.set_text(text_14, $0), [
						() => s('contribute.manual.addTo', { fileName: $.get(snippet).fileName })
					]);

					$.append($$anchor, text_14);
				};

				$.if(node_7, ($$render) => {
					if ($.get(snippet).isFullFile) $$render(consequent_4); else $$render(alternate_2, -1);
				});
			}

			$.reset(span);

			var button_1 = $.sibling(span, 2);
			var node_8 = $.child(button_1);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_4 = root_5();
					var node_9 = $.first_child(fragment_4);

					IconCheck(node_9, { size: 14, class: 'text-green-500' });

					var text_15 = $.sibling(node_9);

					$.template_effect(($0) => $.set_text(text_15, ` ${$0 ?? ''}`), [() => s('contribute.manual.copied')]);
					$.append($$anchor, fragment_4);
				};

				var alternate_3 = ($$anchor) => {
					var fragment_5 = root_5();
					var node_10 = $.first_child(fragment_5);

					IconClipboard(node_10, { size: 14 });

					var text_16 = $.sibling(node_10);

					$.template_effect(($0) => $.set_text(text_16, ` ${$0 ?? ''}`), [() => s('contribute.manual.copy')]);
					$.append($$anchor, fragment_5);
				};

				$.if(node_8, ($$render) => {
					if ($.get(copied)) $$render(consequent_5); else $$render(alternate_3, -1);
				});
			}

			$.reset(button_1);
			$.reset(div_7);

			var pre = $.sibling(div_7, 2);
			var text_17 = $.only_child(pre, true);

			$.reset(div_6);

			var a_1 = $.sibling(div_6, 2);
			var node_11 = $.child(a_1);

			IconBrandGithub(node_11, { size: 16 });

			var text_18 = $.sibling(node_11);
			var node_12 = $.sibling(text_18);

			IconExternalLink(node_12, { size: 14 });
			$.reset(a_1);

			var button_2 = $.sibling(a_1, 2);
			var text_19 = $.only_child(button_2, true);

			$.reset(div_4);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_6, $0);
					$.set_text(text_12, $1);
					$.set_text(text_17, $.get(snippet).content);
					$.set_attribute(a_1, 'href', $.get(snippet).editUrl);
					$.set_text(text_18, ` ${$2 ?? ''} `);
					$.set_text(text_19, $3);
				},
				[
					() => s('contribute.manual.instructions'),
					() => s('contribute.manual.step3'),
					() => s('contribute.manual.editOnGithub', { fileName: $.get(snippet).fileName }),
					() => s('contribute.submitAnother')
				]
			);

			$.delegated('click', button_1, () => handleCopy($.get(snippet).content));

			$.delegated('click', button_2, function (...$$args) {
				$$props.onReset?.apply(this, $$args);
			});

			$.append($$anchor, div_4);
		};

		var consequent_7 = ($$anchor) => {
			var div_8 = root_7();
			var div_9 = $.child(div_8);
			var node_13 = $.child(div_9);

			IconCircleX(node_13, { size: 20, class: 'shrink-0 text-red-600 dark:text-red-400' });

			var p_3 = $.sibling(node_13, 2);
			var text_20 = $.only_child(p_3, true);

			$.reset(div_9);
			$.reset(div_8);
			$.template_effect(() => $.set_text(text_20, $$props.submitResult.message));
			$.append($$anchor, div_8);
		};

		$.if(node, ($$render) => {
			if ($$props.submitResult?.type === 'success') $$render(consequent_1); else if ($$props.submitResult?.type === 'manual' && $$props.submitResult.snippet) $$render(consequent_6, 1); else if ($$props.submitResult?.type === 'error') $$render(consequent_7, 2);
		});
	}

	var node_14 = $.sibling(node, 2);

	{
		var consequent_14 = ($$anchor) => {
			var fragment_6 = root_11();
			var div_10 = $.first_child(fragment_6);
			var node_15 = $.child(div_10);

			{
				var consequent_8 = ($$anchor) => {
					var text_21 = $.text();

					$.template_effect(($0) => $.set_text(text_21, $0), [
						() => s('contribute.summaryNew', {
							category: $$props.activeCategoryName,
							count: String($$props.submittableFeeds.length)
						})
					]);

					$.append($$anchor, text_21);
				};

				var alternate_4 = ($$anchor) => {
					var text_22 = $.text();

					$.template_effect(($0) => $.set_text(text_22, $0), [
						() => s('contribute.summaryExisting', {
							count: String($$props.submittableFeeds.length),
							category: $$props.activeCategoryName
						})
					]);

					$.append($$anchor, text_22);
				};

				$.if(node_15, ($$render) => {
					if ($$props.mode === 'new') $$render(consequent_8); else $$render(alternate_4, -1);
				});
			}

			var node_16 = $.sibling(node_15, 2);

			{
				var consequent_9 = ($$anchor) => {
					var span_1 = root_8();
					var text_23 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_23, $0), [
						() => s('contribute.excludedNote', { count: String($$props.errorFeeds.length) })
					]);

					$.append($$anchor, span_1);
				};

				$.if(node_16, ($$render) => {
					if ($$props.errorFeeds.length > 0 && $$props.submittableFeeds.length > 0) $$render(consequent_9);
				});
			}

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var button_3 = $.child(div_11);
			var node_17 = $.child(button_3);

			{
				var consequent_10 = ($$anchor) => {
					var fragment_9 = root_5();
					var node_18 = $.first_child(fragment_9);

					IconLoader2(node_18, { size: 16, class: 'animate-spin' });

					var text_24 = $.sibling(node_18);

					$.template_effect(($0) => $.set_text(text_24, ` ${$0 ?? ''}`), [() => s('contribute.creatingPr')]);
					$.append($$anchor, fragment_9);
				};

				var consequent_11 = ($$anchor) => {
					var fragment_10 = root_5();
					var node_19 = $.first_child(fragment_10);

					IconBrandGithub(node_19, { size: 16 });

					var text_25 = $.sibling(node_19);

					$.template_effect(($0) => $.set_text(text_25, ` ${$0 ?? ''}`), [() => s('contribute.manual.submit')]);
					$.append($$anchor, fragment_10);
				};

				var alternate_5 = ($$anchor) => {
					var fragment_11 = root_5();
					var node_20 = $.first_child(fragment_11);

					IconSend(node_20, { size: 16 });

					var text_26 = $.sibling(node_20);

					$.template_effect(($0) => $.set_text(text_26, ` ${$0 ?? ''}`), [() => s('contribute.createPr')]);
					$.append($$anchor, fragment_11);
				};

				$.if(node_17, ($$render) => {
					if ($$props.isSubmitting) $$render(consequent_10); else if ($$props.githubMode === 'manual') $$render(consequent_11, 1); else $$render(alternate_5, -1);
				});
			}

			$.reset(button_3);
			$.reset(div_11);

			var node_21 = $.sibling(div_11, 2);

			{
				var consequent_12 = ($$anchor) => {
					var p_4 = root_9();
					var text_27 = $.only_child(p_4, true);

					$.template_effect(($0) => $.set_text(text_27, $0), [
						() => s('contribute.waitingValidation', { count: String($$props.pendingFeeds.length) })
					]);

					$.append($$anchor, p_4);
				};

				$.if(node_21, ($$render) => {
					if ($$props.pendingFeeds.length > 0) $$render(consequent_12);
				});
			}

			var node_22 = $.sibling(node_21, 2);

			{
				var consequent_13 = ($$anchor) => {
					var p_5 = root_10();
					var text_28 = $.only_child(p_5, true);

					$.template_effect(($0) => $.set_text(text_28, $0), [() => s('contribute.cannotSubmit')]);
					$.append($$anchor, p_5);
				};

				$.if(node_22, ($$render) => {
					if ($$props.allErrored) $$render(consequent_13);
				});
			}

			$.template_effect(() => button_3.disabled = !$$props.canSubmit || $$props.isSubmitting);

			$.delegated('click', button_3, function (...$$args) {
				$$props.onSubmit?.apply(this, $$args);
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_14, ($$render) => {
			if (!$$props.submitResult || $$props.submitResult.type === 'error') $$render(consequent_14);
		});
	}

	$.reset(div);
	$.template_effect(($0) => $.set_text(text_1, $0), [() => s('contribute.step3')]);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);