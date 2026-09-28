import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from "bits-ui";
import X from "phosphor-svelte/lib/X";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'children',
	'buttonText',
	'contentProps',
	'title',
	'description'
]);

var root = $.from_html(`<div><!> <span class="sr-only">Close</span></div>`);
var root_1 = $.from_html(`<!> <!> <div class="flex min-h-[200px] flex-col gap-4 pb-12"><!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dialog_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	// ...other component props if you wish to pass them
	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	inline-flex h-12 items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $$props.buttonText));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-nested:hidden fixed inset-0 z-50 bg-black/80 transition-opacity duration-200'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, $.spread_props(() => $$props.contentProps, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%+var(--bits-dialog-nested-count)*-1.5rem)] scale-[calc(1-var(--bits-dialog-nested-count)*0.05)] border p-6 transition-all duration-200 sm:max-w-[500px] md:w-full',
									style: 'filter: blur(calc(var(--bits-dialog-nested-count) * 1.5px)); min-height: 400px;',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'mb-2 text-center text-lg font-semibold tracking-tight',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.snippet(node_6, () => $$props.title);
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-foreground-alt mb-6 text-center text-sm',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.snippet(node_8, () => $$props.description);
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_7, 2);
										var node_9 = $.child(div);

										$.snippet(node_9, () => $$props.children ?? $.noop);
										$.reset(div);

										var node_10 = $.sibling(div, 2);

										$.component(node_10, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												class: 'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													var div_1 = root();
													var node_11 = $.child(div_1);

													X(node_11, { class: 'text-foreground size-5' });
													$.next(2);
													$.reset(div_1);
													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}