import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Thumb_icons($$anchor, $$props) {
	$.push($$props, true);

	Switch($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									{
										const children = ($$anchor, switch_ = $.noop) => {
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											{
												var consequent = ($$anchor) => {
													SunIcon($$anchor, { class: 'size-3' });
												};

												var d = $.derived(() => switch_()().checked);

												var alternate = ($$anchor) => {
													MoonIcon($$anchor, { class: 'size-3' });
												};

												$.if(node_3, ($$render) => {
													if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_4);
										};

										$.component(node_2, () => Switch.Context, ($$anchor, Switch_Context) => {
											Switch_Context($$anchor, { children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}