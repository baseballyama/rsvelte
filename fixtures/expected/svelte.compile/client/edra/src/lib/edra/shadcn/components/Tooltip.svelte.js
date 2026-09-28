import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';

var root = $.from_html(`<span class="rounded bg-background p-0.5 text-primary"> </span>`);
var root_1 = $.from_html(`<span> </span> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_1($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 100,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.snippet(node_3, () => $$props.children);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var span = $.first_child(fragment_4);
										var text = $.only_child(span, true);
										var node_5 = $.sibling(span, 2);

										{
											var consequent = ($$anchor) => {
												var span_1 = root();
												var text_1 = $.only_child(span_1, true);

												$.template_effect(() => $.set_text(text_1, $$props.shortCut));
												$.append($$anchor, span_1);
											};

											$.if(node_5, ($$render) => {
												if ($$props.shortCut) $$render(consequent);
											});
										}

										$.template_effect(() => $.set_text(text, $$props.tooltip));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

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
}