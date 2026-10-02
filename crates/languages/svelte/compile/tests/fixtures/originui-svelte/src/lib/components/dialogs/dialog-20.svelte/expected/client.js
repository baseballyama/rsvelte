import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import DialogImg from '$lib/assets/dialog-content.png';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`Next <!>`, 1);
var root_3 = $.from_html(`<div class="p-2"><img class="w-full rounded-lg" alt="dialog"/></div> <div class="space-y-6 px-6 pt-3 pb-6"><!> <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div class="flex justify-center space-x-1.5 max-sm:order-1"></div> <!></div></div>`, 1);

export default function Dialog_20($$anchor, $$props) {
	$.push($$props, true);

	const steps = [
		{
			description: 'Discover a powerful collection of components designed to enhance your development workflow.',
			title: 'Welcome to Origin UI'
		},

		{
			description: 'Each component is fully customizable and built with modern web standards in mind.',
			title: 'Customizable Components'
		},

		{
			description: 'Begin building amazing interfaces with our comprehensive component library.',
			title: 'Ready to Start?'
		},

		{
			description: 'Access our extensive documentation and community resources to make the most of Origin UI.',
			title: 'Get Support'
		}
	];

	let step = $.state(1);

	function handleContinue() {
		if ($.get(step) < steps.length) {
			$.set(step, $.get(step) + 1);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			onOpenChange: (open) => {
				if (open) $.set(step, 1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Onboarding');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'gap-0 p-0 [&>button:last-child]:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var div = $.first_child(fragment_2);
							var img = $.child(div);

							$.set_attribute(img, 'width', 382);
							$.set_attribute(img, 'height', 216);
							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_3 = $.child(div_1);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, steps[$.get(step) - 1].title));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, steps[$.get(step) - 1].description));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var div_2 = $.sibling(node_3, 2);
							var div_3 = $.child(div_2);

							$.each(div_3, 21, () => ({ length: steps.length }), $.index, ($$anchor, _, index) => {
								var div_4 = root_1();

								$.template_effect(($0) => $.set_class(div_4, 1, $0), [
									() => $.clsx(cn('bg-primary h-1.5 w-1.5 rounded-full', index + 1 === $.get(step) ? 'bg-primary' : 'opacity-20'))
								]);

								$.append($$anchor, div_4);
							});

							$.reset(div_3);

							var node_6 = $.sibling(div_3, 2);

							$.component(node_6, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_7 = $.first_child(fragment_6);

										{
											let $0 = $.derived(() => buttonVariants({ variant: 'ghost' }));

											$.component(node_7, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Skip');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_8 = $.sibling(node_7, 2);

										{
											var consequent = ($$anchor) => {
												Button($$anchor, {
													class: 'group',
													type: 'button',
													onclick: handleContinue,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_8 = root_2();
														var node_9 = $.sibling($.first_child(fragment_8));

														ArrowRight(node_9, {
															className: '-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5',
															size: 16,
															'aria-hidden': 'true'
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											};

											var alternate = ($$anchor) => {
												var fragment_9 = $.comment();
												var node_10 = $.first_child(fragment_9);

												{
													let $0 = $.derived(buttonVariants);

													$.component(node_10, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
														Dialog_Close_1($$anchor, {
															get class() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Okay');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_9);
											};

											$.if(node_8, ($$render) => {
												if ($.get(step) < steps.length) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_2);
							$.reset(div_1);
							$.template_effect(() => $.set_attribute(img, 'src', DialogImg));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}