import 'svelte/internal/disclose-version';
import { Toolbar } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'multipleProps',
	'singleProps'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<main><button aria-label="style" data-testid="style-binding"> </button> <button aria-label="align" data-testid="align-binding"> </button> <span data-testid="clicked-binding"> </span> <!></main>`);

export default function Toolbar_test($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	let style = $.state($.proxy(["bold"]));
	let align = $.state("");
	let clicked = $.state(void 0);
	var main = root_2();
	var button = $.child(main);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);
	var span = $.sibling(button_1, 2);
	var text_2 = $.only_child(span, true);
	var node = $.sibling(span, 2);

	$.component(node, () => Toolbar.Root, ($$anchor, Toolbar_Root) => {
		Toolbar_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Toolbar.Group, ($$anchor, Toolbar_Group) => {
					Toolbar_Group($$anchor, $.spread_props({ 'data-testid': 'group-multiple', type: 'multiple' }, () => $$props.multipleProps, {
						get value() {
							return $.get(style);
						},

						set value($$value) {
							$.set(style, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem) => {
								Toolbar_GroupItem($$anchor, {
									'data-testid': 'group-multiple-bold',
									'aria-label': 'toggle bold',
									value: 'bold',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Bold');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_1) => {
								Toolbar_GroupItem_1($$anchor, {
									'data-testid': 'group-multiple-italic',
									'aria-label': 'toggle italic',
									value: 'italic',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Italic');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_2) => {
								Toolbar_GroupItem_2($$anchor, {
									'data-testid': 'group-multiple-strikethrough',
									'aria-label': 'toggle strikethrough',
									value: 'strikethrough',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Strikethrough');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Toolbar.Group, ($$anchor, Toolbar_Group_1) => {
					Toolbar_Group_1($$anchor, $.spread_props({ 'data-testid': 'group-single', type: 'single' }, () => $$props.singleProps, {
						get value() {
							return $.get(align);
						},

						set value($$value) {
							$.set(align, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_6 = $.first_child(fragment_2);

							$.component(node_6, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_3) => {
								Toolbar_GroupItem_3($$anchor, {
									'data-testid': 'group-single-left',
									'aria-label': 'align left',
									value: 'left',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Left');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_4) => {
								Toolbar_GroupItem_4($$anchor, {
									'data-testid': 'group-single-center',
									'aria-label': 'align center',
									value: 'center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Center');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_5) => {
								Toolbar_GroupItem_5($$anchor, {
									'data-testid': 'group-single-right',
									'aria-label': 'align right',
									value: 'right',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text('Right');

										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}));
				});

				var node_9 = $.sibling(node_5, 2);

				$.component(node_9, () => Toolbar.Link, ($$anchor, Toolbar_Link) => {
					Toolbar_Link($$anchor, {
						'data-testid': 'link',
						onclick: () => $.set(clicked, "link"),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Edited 2 hours ago');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => Toolbar.Button, ($$anchor, Toolbar_Button) => {
					Toolbar_Button($$anchor, {
						'data-testid': 'button',
						onclick: () => $.set(clicked, "button"),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Save');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);

	$.template_effect(() => {
		$.set_text(text, $.get(style));
		$.set_text(text_1, $.get(align));
		$.set_text(text_2, $.get(clicked));
	});

	$.delegated('click', button, () => $.set(style, ["italic"], true));
	$.delegated('click', button_1, () => $.set(align, "center"));
	$.append($$anchor, main);
}

$.delegate(['click']);