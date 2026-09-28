import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Tooltip } from '@appwrite.io/pink-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { SideSheet } from '$database/(entity)';

var root = $.from_html(`<button aria-label="Open column review modal"><!></button>`);
var root_1 = $.from_html(`<button><!></button>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(` <!>`, 1);
var root_4 = $.from_html(`<div slot="tooltip"><!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Options($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let toggleOnTapClick = $.prop($$props, 'toggleOnTapClick', 3, true),
		onShowStateChanged = $.prop($$props, 'onShowStateChanged', 3, null),
		enabled = $.prop($$props, 'enabled', 3, true);

	let showSheet = $.state(false);

	$.user_effect(() => {
		if (!$isSmallViewport()) {
			$.set(showSheet, false);
		}
	});

	$.user_effect(() => {
		if ($isSmallViewport() && $$props.triggerOpen && $$props.triggerOpen()) {
			$.set(showSheet, true);
		}
	});

	var fragment = root_5();
	var node = $.first_child(fragment);

	Popover(node, {
		portal: true,
		padding: 'none',
		placement: 'bottom-start',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const toggle = $.derived(() => $$slotProps.toggle);
				const showing = $.derived(() => $$slotProps.showing);

				$.next();

				var fragment_1 = root_3();
				var text = $.first_child(fragment_1);
				var node_1 = $.sibling(text);

				{
					var consequent = ($$anchor) => {
						var button = root();
						var node_2 = $.child(button);

						$.snippet(node_2, () => $$props.children, () => () => $.set(showSheet, false));
						$.reset(button);
						$.delegated('click', button, () => enabled() && $.set(showSheet, true));
						$.append($$anchor, button);
					};

					var alternate = ($$anchor) => {
						var div = root_2();

						$.set_style(div, '', {}, { display: 'grid' });

						var node_3 = $.child(div);

						{
							let $0 = $.derived(() => !$$props.headerTooltipText || $.get(showing));

							Tooltip(node_3, {
								maxWidth: '225px',
								portal: true,
								get disabled() {
									return $.get($0);
								},
								delay: 100,
								children: ($$anchor, $$slotProps) => {
									var button_1 = root_1();
									let styles;
									var node_4 = $.child(button_1);

									$.snippet(node_4, () => $$props.children, () => $.get(toggle));
									$.reset(button_1);
									$.template_effect(() => styles = $.set_style(button_1, '', styles, { cursor: enabled() ? 'pointer' : undefined }));
									$.delegated('click', button_1, () => enabled() && $$props.onChildrenClick?.());
									$.append($$anchor, button_1);
								},

								$$slots: {
									default: true,
									tooltip: ($$anchor, $$slotProps) => {
										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $$props.headerTooltipText));
										$.append($$anchor, text_1);
									}
								}
							});
						}

						$.reset(div);
						$.append($$anchor, div);
					};

					$.if(node_1, ($$render) => {
						if (toggleOnTapClick() && $isSmallViewport()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} `), [
					() => onShowStateChanged()?.($.get(showing) || $.get(showSheet))
				]);

				$.append($$anchor, fragment_1);
			},

			tooltip: ($$anchor, $$slotProps) => {
				const toggle = $.derived(() => $$slotProps.toggle);
				var div_1 = root_4();

				$.set_style(div_1, '', {}, { width: '480px', padding: '16px' });

				var node_5 = $.child(div_1);

				$.snippet(node_5, () => $$props.tooltipChildren, () => $.get(toggle));
				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	var node_6 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				const footer = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.snippet(node_7, () => $$props.mobileFooterChildren ?? $.noop, () => () => $.set(showSheet, false));
					$.append($$anchor, fragment_4);
				};

				SideSheet($$anchor, {
					title: 'Edit suggested column',
					submit: {
						text: 'Update',
						onClick: () => {
							$.set(showSheet, false);
						}
					},

					get show() {
						return $.get(showSheet);
					},

					set show($$value) {
						$.set(showSheet, $$value, true);
					},
					footer,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.snippet(node_8, () => $$props.tooltipChildren, () => () => $.set(showSheet, false));
						$.append($$anchor, fragment_5);
					},
					$$slots: { footer: true, default: true }
				});
			}
		};

		$.if(node_6, ($$render) => {
			if ($isSmallViewport()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);