import 'svelte/internal/disclose-version';
import { Popover } from "bits-ui";
import * as $ from 'svelte/internal/client';

const Content = ($$anchor, $$arg0) => {
	let props = () => ($$arg0?.()).props;
	let wrapperProps = () => ($$arg0?.()).wrapperProps;
	var div = root();

	$.attribute_effect(div, () => ({ ...wrapperProps() }));

	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({ ...props() }));

	var node = $.sibling($.child(div_1), 6);

	$.component(node, () => Popover.Close, ($$anchor, Popover_Close) => {
		Popover_Close($$anchor, {
			'data-testid': 'close',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('close');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
		Popover_Arrow($$anchor, { 'data-testid': 'arrow' });
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'triggerProps',
	'contentProps',
	'portalProps',
	'withOpenCheck'
]);

var root = $.from_html(`<div><div><div data-testid="content-text">content</div> <button data-testid="focusable-button">focusable button</button> <input data-testid="focusable-input" type="text" placeholder="input"/> <!> <!></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main" style="display: flex; flex-direction: column; gap: 200px; padding: 20px;"><div><!> <button data-testid="binding"> </button></div> <div data-testid="outside" style="padding: 20px; background: #eee;">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Popover_force_mount_test($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_2();
	var main = $.first_child(fragment);
	var div_2 = $.child(main);
	var node_2 = $.child(div_2);

	$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, $.spread_props({ 'data-testid': 'trigger' }, () => $$props.triggerProps, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('trigger');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					}));
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_6 = $.first_child(fragment_3);

									{
										const child = ($$anchor, props = $.noop) => {
											var fragment_4 = $.comment();
											var node_7 = $.first_child(fragment_4);

											{
												var consequent = ($$anchor) => {
													Content($$anchor, props);
												};

												$.if(node_7, ($$render) => {
													if (props().open) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_4);
										};

										$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
											Popover_Content($$anchor, $.spread_props(() => $$props.contentProps, {
												'data-testid': 'content',
												forceMount: true,
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									{
										const child = ($$anchor, props = $.noop) => {
											Content($$anchor, props);
										};

										$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content_1) => {
											Popover_Content_1($$anchor, $.spread_props(() => $$props.contentProps, {
												'data-testid': 'content',
												forceMount: true,
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_6);
								};

								$.if(node_5, ($$render) => {
									if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

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

	var button = $.sibling(node_2, 2);
	var text_2 = $.only_child(button, true);

	$.reset(div_2);
	$.next(2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_2, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);