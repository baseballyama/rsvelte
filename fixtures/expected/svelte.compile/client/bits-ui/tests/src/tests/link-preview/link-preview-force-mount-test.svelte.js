import 'svelte/internal/disclose-version';
import { LinkPreview } from "bits-ui";
import * as $ from 'svelte/internal/client';

const Content = ($$anchor, $$arg0) => {
	let props = () => ($$arg0?.()).props;
	let wrapperProps = () => ($$arg0?.()).wrapperProps;
	var div = root();

	$.attribute_effect(div, () => ({ ...wrapperProps() }));

	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({ ...props() }));
	$.reset(div);
	$.append($$anchor, div);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'contentProps',
	'portalProps',
	'withOpenCheck'
]);

var root = $.from_html(`<div><div>Content</div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Link_preview_force_mount_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_2();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => LinkPreview.Root, ($$anchor, LinkPreview_Root) => {
		LinkPreview_Root($$anchor, $.spread_props(() => restProps, {
			openDelay: 50,
			closeDelay: 50,
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => LinkPreview.Trigger, ($$anchor, LinkPreview_Trigger) => {
					LinkPreview_Trigger($$anchor, {
						'data-testid': 'trigger',
						href: 'https://github.com/sveltejs',
						target: '_blank',
						rel: 'noreferrer noopener',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('@sveltejs');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => LinkPreview.Portal, ($$anchor, LinkPreview_Portal) => {
					LinkPreview_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									{
										const child = ($$anchor, props = $.noop) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											{
												var consequent = ($$anchor) => {
													Content($$anchor, props);
												};

												$.if(node_5, ($$render) => {
													if (props().open) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_4);
										};

										$.component(node_4, () => LinkPreview.Content, ($$anchor, LinkPreview_Content) => {
											LinkPreview_Content($$anchor, $.spread_props({ 'data-testid': 'content', class: 'w-80' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_6 = $.first_child(fragment_6);

									{
										const child = ($$anchor, props = $.noop) => {
											Content($$anchor, props);
										};

										$.component(node_6, () => LinkPreview.Content, ($$anchor, LinkPreview_Content_1) => {
											LinkPreview_Content_1($$anchor, $.spread_props({ 'data-testid': 'content', class: 'w-80' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_6);
								};

								$.if(node_3, ($$render) => {
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

	var button = $.sibling(node, 2);
	var text_1 = $.only_child(button, true);

	$.next(2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_1, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);