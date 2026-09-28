import 'svelte/internal/disclose-version';
import { AlertDialog } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'contentProps',
	'portalProps',
	'titleProps',
	'descriptionProps'
]);

var root = $.from_html(`<!> <!> <!> <!> <button id="open-focus-override" data-testid="open-focus-override">open focus override</button>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main class="flex flex-col gap-2"><!> <p data-testid="binding"> </p> <button data-testid="toggle">toggle</button> <button id="close-focus-override" data-testid="close-focus-override">close focus override</button> <div id="portalTarget" data-testid="portalTarget"></div> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div></main>`);

export default function Alert_dialog_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		contentProps = $.prop($$props, 'contentProps', 19, () => ({})),
		portalProps = $.prop($$props, 'portalProps', 19, () => ({})),
		titleProps = $.prop($$props, 'titleProps', 19, () => ({})),
		descriptionProps = $.prop($$props, 'descriptionProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var node = $.child(main);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
					AlertDialog_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal) => {
					AlertDialog_Portal($$anchor, $.spread_props(portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay) => {
								AlertDialog_Overlay($$anchor, {
									'data-testid': 'overlay',
									class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Overlay');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
								AlertDialog_Content($$anchor, $.spread_props(contentProps, {
									'data-testid': 'content',
									class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, $.spread_props(titleProps, {
												'data-testid': 'title',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('title');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											}));
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, $.spread_props(descriptionProps, {
												'data-testid': 'description',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('description');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											}));
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												'data-testid': 'cancel',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('cancel');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												'data-testid': 'action',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('action');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.next(2);
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var p = $.sibling(node, 2);
	var text_6 = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.next(6);
	$.reset(main);
	$.template_effect(() => $.set_text(text_6, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, main);
}

$.delegate(['click']);