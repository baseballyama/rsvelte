import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timer } from '$lib/actions/timer';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<p></p> <!>`, 1);

export default function LogsTimer($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let effectiveStatus = $.derived(() => getEffectiveBuildStatus($$props.deployment, $regionalConsoleVariables()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			direction: 'row',
			alignItems: 'center',
			inline: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Typography.Code, ($$anchor, Typography_Code) => {
							Typography_Code($$anchor, {
								color: '--fgcolor-neutral-secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											direction: 'row',
											alignItems: 'center',
											inline: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var p = $.first_child(fragment_4);

												$.action(p, ($$node, $$action_arg) => timer?.($$node, $$action_arg), () => ({ start: $$props.deployment.$createdAt }));

												var node_4 = $.sibling(p, 2);

												Spinner(node_4, { size: 's' });
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					var d = $.derived(() => ['processing', 'building', 'finalizing'].includes($.get(effectiveStatus)));

					var alternate = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_5 = $.first_child(fragment_5);

						$.component(node_5, () => Typography.Code, ($$anchor, Typography_Code_1) => {
							Typography_Code_1($$anchor, {
								color: '--fgcolor-neutral-secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(($0) => $.set_text(text, $0), [() => formatTimeDetailed($$props.deployment.buildDuration)]);
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}