import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MinusIcon, PlusIcon } from '@lucide/svelte';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import CheckIcon from '@lucide/svelte/icons/check';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<li class="flex items-center gap-3"><!> <span class="text-sm"> </span></li>`);
var root_1 = $.from_html(`<tr><td class="p-4 font-bold"> </td><td class="p-4 text-center opacity-60"> </td><td class="p-4 text-center opacity-60"> </td><td class="p-4 text-center opacity-60"> </td></tr>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span class="h5"> </span> <!>`, 1);
var root_4 = $.from_html(`<h3><!></h3> <!>`, 1);
var root_5 = $.from_html(`<hr class="hr"/>`);
var root_6 = $.from_html(`<section class="container-page preset-tonal-warning text-center space-y-2!"><p><strong>WARNING</strong>: this page is a <u>work in progress</u> and may not represent the final tier information.</p></section> <section class="container-page border-b border-surface-200-800 lg:py-20! text-center space-y-2!"><h1 class="h1 text-balance">Purchase once. Access forever.</h1> <p class="opacity-60">Access a variety of free and premium features to level up your Skeleton applications.</p></section> <section class="border-b border-surface-200-800"><div class="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-200-800"><div class="container-cell p-10! lg:p-16! flex flex-col gap-6"><div class="space-y-2"><p class="text-xs font-semibold uppercase tracking-widest opacity-60">Basic</p> <div class="flex items-end gap-2"><p class="text-5xl font-bold">FREE</p></div> <p class="opacity-60 text-sm">For everyone, forever.</p></div> <a href="/auth/sign-in" class="btn btn-lg preset-outlined-surface-200-800 w-full"><span>Get Plus</span> <!></a> <ul class="space-y-3"></ul></div> <div class="preset-tonal-primary container-cell p-10! lg:p-16! flex flex-col gap-6"><div class="space-y-2"><p class="text-xs font-semibold uppercase tracking-widest opacity-60">Individual</p> <div class="flex items-end gap-2"><p class="text-5xl font-bold">$XXX</p> <div><p>USD</p> <p>One-Time</p></div></div> <p class="opacity-60 text-sm">One-time payment. Lifetime updates for you.</p></div> <a href="/#" class="btn btn-lg preset-filled w-full"><span>Get Plus</span> <!></a> <ul class="space-y-3"></ul></div> <div class="container-cell p-10! lg:p-16! flex flex-col gap-6"><div class="space-y-2"><p class="text-xs font-semibold uppercase tracking-widest opacity-60">Team</p> <div class="flex items-end gap-2"><p class="text-5xl font-bold">$XXX</p> <div><p>USD</p> <p>One-Time</p></div></div> <p class="opacity-60 text-sm">One-time payment. Lifetime updates for your team.</p></div> <a href="/#" class="btn btn-lg preset-filled w-full"><span>Get Plus</span> <!></a> <ul class="space-y-3"></ul></div></div></section> <section class="container-page border-b border-surface-200-800"><div class="card preset-filled-surface-50-950 border border-surface-200-800 table-wrap"><table class="table caption-bottom"><thead><tr><th class="text-surface-950-50">&nbsp;</th><th class="text-surface-950-50 text-center">Basic</th><th class="text-surface-950-50 text-center">Individual</th><th class="text-surface-950-50 text-center">Team</th></tr></thead><tbody class="[&amp;>tr]:hover:preset-filled-surface-100-900"></tbody></table></div></section> <section class="container-page mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 md:gap-10"><h2 class="h2 text-balance">Frequently Asked Questions.</h2> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const freeFeatures = [
		'Studio tools',
		'Save & manage themes',
		'All free blocks',
		'All free templates',
		'Community tools',
		'Fundamental tutorials',
		'Community tools'
	];

	const individualFeatures = [
		'Everything in Free',
		'Expanded theme storage',
		'All premium blocks',
		'All premium templates',
		'Figma UI kit',
		'Advanced tutorials',
		'Priority support'
	];

	const teamFeatures = [
		'Everything in Individual',
		'Up to 25 team seats',
		'Shared theme collections',
		'Admin controls',
		'Dedicated support'
	];

	const compareRows = [
		{
			feature: 'Studio tools',
			free: '✓',
			individual: '✓',
			team: '✓'
		},

		{
			feature: 'Community themes',
			free: '✓',
			individual: '✓',
			team: '✓'
		},

		{
			feature: 'Save & manage themes',
			free: 'Max of 5',
			individual: 'Unlimited',
			team: 'Unlimited'
		},

		{
			feature: 'Blocks',
			free: 'Limited',
			individual: 'All',
			team: 'All'
		},

		{
			feature: 'Templates',
			free: '2 Free',
			individual: 'All',
			team: 'All'
		},

		{
			feature: 'Tutorials',
			free: 'Fundamentals',
			individual: 'All',
			team: 'All'
		},

		{
			feature: 'Figma UI Kit',
			free: '',
			individual: '✓',
			team: '✓'
		},

		{
			feature: 'Community tools',
			free: '✓',
			individual: '✓',
			team: '✓'
		},
		{ feature: 'Team seats', free: '', individual: '', team: '25' },
		{
			feature: 'Shared theme collections',
			free: '',
			individual: '',
			team: '✓'
		},

		{
			feature: 'Admin controls',
			free: '',
			individual: '',
			team: '✓'
		},

		{
			feature: 'Priority support',
			free: '',
			individual: '✓',
			team: '✓'
		},

		{
			feature: 'Dedicated support',
			free: '',
			individual: '',
			team: '✓'
		}
	];

	const faqs = [
		{
			value: 'free-tier',
			question: 'What do I get for free?',
			answer: 'Full access to all Studio tools, the ability to save and manage up to 5 themes, all free blocks and templates, community tools, and our fundamentals tutorial library. Free forever with a basic Plus account. No credit card required.'
		},

		{
			value: 'lifetime-updates',
			question: 'Does "lifetime updates" really mean lifetime?',
			answer: 'Yes. A one-time purchase of any Plus tier grants you access to all future updates to the assets and features included in that tier, with no recurring subscription fee. As Skeleton evolves, your Plus license evolves with it.'
		},

		{
			value: 'team-seats',
			question: 'How do team seats work?',
			answer: 'A Plus Team license covers up to 25 individual seats. Each seat holder gets their own Plus Individual benefits plus access to shared team features like theme collections and admin controls. Seats are managed by the account owner through the team admin panel.'
		},

		{
			value: 'upgrade',
			question: 'Can I upgrade from Individual to Team later?',
			answer: 'Yes. You can upgrade your license at any time. When upgrading from Plus Individual to Plus Team, you will only be charged the difference in price. Your existing themes, blocks, and templates remain intact.'
		}
	];

	var $$exports = { faqs };
	var fragment = root_6();
	var section = $.sibling($.first_child(fragment), 4);
	var div = $.child(section);
	var div_1 = $.child(div);
	var a = $.sibling($.child(div_1), 2);
	var node = $.sibling($.child(a), 2);

	ArrowRightIcon(node, {});
	$.reset(a);

	var ul = $.sibling(a, 2);

	$.each(ul, 21, () => freeFeatures, $.index, ($$anchor, feature) => {
		var li = root();
		var node_1 = $.child(li);

		CheckIcon(node_1, { class: 'size-4 opacity-60 shrink-0' });

		var span = $.sibling(node_1, 2);
		var text = $.only_child(span, true);

		$.reset(li);
		$.template_effect(() => $.set_text(text, $.get(feature)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var a_1 = $.sibling($.child(div_2), 2);
	var node_2 = $.sibling($.child(a_1), 2);

	ArrowRightIcon(node_2, {});
	$.reset(a_1);

	var ul_1 = $.sibling(a_1, 2);

	$.each(ul_1, 21, () => individualFeatures, $.index, ($$anchor, feature) => {
		var li_1 = root();
		var node_3 = $.child(li_1);

		CheckIcon(node_3, { class: 'size-4 opacity-60 shrink-0' });

		var span_1 = $.sibling(node_3, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(li_1);
		$.template_effect(() => $.set_text(text_1, $.get(feature)));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var a_2 = $.sibling($.child(div_3), 2);
	var node_4 = $.sibling($.child(a_2), 2);

	ArrowRightIcon(node_4, {});
	$.reset(a_2);

	var ul_2 = $.sibling(a_2, 2);

	$.each(ul_2, 21, () => teamFeatures, $.index, ($$anchor, feature) => {
		var li_2 = root();
		var node_5 = $.child(li_2);

		CheckIcon(node_5, { class: 'size-4 opacity-60 shrink-0' });

		var span_2 = $.sibling(node_5, 2);
		var text_2 = $.only_child(span_2, true);

		$.reset(li_2);
		$.template_effect(() => $.set_text(text_2, $.get(feature)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_3);
	$.reset(div);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.child(section_1);
	var table = $.child(div_4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => compareRows, $.index, ($$anchor, row) => {
		var tr = root_1();
		var td = $.child(tr);
		var text_3 = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_4 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_5 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_6 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_3, $.get(row).feature);
			$.set_text(text_4, $.get(row).free);
			$.set_text(text_5, $.get(row).individual);
			$.set_text(text_6, $.get(row).team);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_4);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_6 = $.sibling($.child(section_2), 2);

	Accordion(node_6, {
		collapsible: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_7 = $.first_child(fragment_1);

			$.each(node_7, 17, () => faqs, $.index, ($$anchor, faq, i) => {
				var fragment_2 = root_2();
				var node_8 = $.first_child(fragment_2);

				$.component(node_8, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						get value() {
							return $.get(faq).value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_4();
							var h3 = $.first_child(fragment_3);
							var node_9 = $.child(h3);

							$.component(node_9, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
								Accordion_ItemTrigger($$anchor, {
									class: 'flex justify-between items-center font-bold type-scale-5',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();
										var span_3 = $.first_child(fragment_4);
										var text_7 = $.only_child(span_3, true);
										var node_10 = $.sibling(span_3, 2);

										$.component(node_10, () => Accordion.ItemIndicator, ($$anchor, Accordion_ItemIndicator) => {
											Accordion_ItemIndicator($$anchor, {
												class: 'group',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_11 = $.first_child(fragment_5);

													MinusIcon(node_11, { class: 'size-4 group-data-[state=open]:block hidden' });

													var node_12 = $.sibling(node_11, 2);

													PlusIcon(node_12, { class: 'size-4 group-data-[state=open]:hidden block' });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.template_effect(() => $.set_text(text_7, $.get(faq).question));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h3);

							var node_13 = $.sibling(h3, 2);

							$.component(node_13, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
								Accordion_ItemContent($$anchor, {
									class: 'opacity-60',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(faq).answer));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_8, 2);

				{
					var consequent = ($$anchor) => {
						var hr = root_5();

						$.append($$anchor, hr);
					};

					$.if(node_14, ($$render) => {
						if (i < faqs.length - 1) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(section_2);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}