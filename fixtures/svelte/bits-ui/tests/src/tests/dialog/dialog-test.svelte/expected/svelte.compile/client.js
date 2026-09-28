import 'svelte/internal/disclose-version';
import { Dialog } from "bits-ui";
import * as $ from 'svelte/internal/client';
import { useId } from "bits-ui";

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

var root = $.from_html(`<!> <!> <!> <button data-testid="update-id">Reactively update description id</button> <button data-testid="open-focus-override" id="open-focus-override">open focus override</button>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><!> <p data-testid="binding"> </p> <button data-testid="toggle">toggle</button> <button data-testid="close-focus-override" id="close-focus-override">close focus override</button> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <div id="portalTarget" data-testid="portalTarget"></div></main>`);

export default function Dialog_test($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 7, false),
		contentProps = $.prop($$props, 'contentProps', 19, () => ({})),
		portalProps = $.prop($$props, 'portalProps', 19, () => ({})),
		titleProps = $.prop($$props, 'titleProps', 19, () => ({})),
		descriptionProps = $.prop($$props, 'descriptionProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let descriptionId = $.state($.proxy(descriptionProps().id ?? useId()));
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
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

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, $.spread_props(portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									'data-testid': 'overlay',
									class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('overlay');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, $.spread_props(contentProps, {
									'data-testid': 'content',
									class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, $.spread_props(titleProps, {
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

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, $.spread_props(descriptionProps, {
												get id() {
													return $.get(descriptionId);
												},
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

										$.component(node_7, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												'data-testid': 'close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('close');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var button = $.sibling(node_7, 2);

										$.next(2);
										$.delegated('click', button, () => $.set(descriptionId, "new-id"));
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
	var text_5 = $.only_child(p, true);
	var button_1 = $.sibling(p, 2);

	$.next(6);
	$.reset(main);
	$.template_effect(() => $.set_text(text_5, open()));
	$.delegated('click', button_1, () => open(!open()));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);