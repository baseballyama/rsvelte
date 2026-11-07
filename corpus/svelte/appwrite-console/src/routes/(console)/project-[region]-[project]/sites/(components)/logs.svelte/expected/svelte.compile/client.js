import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { capitalize } from '$lib/helpers/string';
import { app } from '$lib/stores/app';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { Badge, Card, Layout, Logs, Spinner, Typography } from '@appwrite.io/pink-svelte';
import LogsTimer from './logsTimer.svelte';

export function badgeTypeDeployment(status) {
	switch (status) {
		case 'failed':
			return 'error';

		case 'ready':
			return 'success';

		case 'building':

		case 'finalizing':
			return 'warning';

		case 'processing':
			return undefined;

		default:
			return undefined;
	}
}

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Waiting for build to start...`, 1);

export default function Logs_1($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let hideTitle = $.prop($$props, 'hideTitle', 3, false),
		hideScrollButtons = $.prop($$props, 'hideScrollButtons', 3, false),
		height = $.prop($$props, 'height', 3, 'auto'),
		fullHeight = $.prop($$props, 'fullHeight', 3, false),
		emptyCopy = $.prop($$props, 'emptyCopy', 3, 'No logs available');

	let effectiveStatus = $.derived(() => getEffectiveBuildStatus($$props.deployment, $regionalConsoleVariables()));

	function setCopy() {
		if ($.get(effectiveStatus) === 'failed') {
			return 'Your deployment has failed.';
		} else if ($.get(effectiveStatus) === 'building') {
			//Do not remove empty space before the string it's an invisible character
			return '[37mPreparing for build ... [0m\n';
		} else if ($.get(effectiveStatus) === 'waiting') {
			return '[37mPreparing for build ... [0m\n';
		} else if ($.get(effectiveStatus) === 'processing') {
			return '[37mPreparing for build ... [0m\n';
		} else {
			return emptyCopy();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xl',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								justifyContent: 'space-between',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											direction: 'row',
											alignItems: 'center',
											gap: 's',
											inline: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														variant: 'm-500',
														color: '--fgcolor-neutral-primary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Deployment logs');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												{
													let $0 = $.derived(() => capitalize($.get(effectiveStatus)));
													let $1 = $.derived(() => badgeTypeDeployment($.get(effectiveStatus)));

													Badge(node_5, {
														get content() {
															return $.get($0);
														},
														size: 'xs',
														variant: 'secondary',
														get type() {
															return $.get($1);
														}
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									LogsTimer(node_6, {
										get deployment() {
											return $$props.deployment;
										}
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if (!hideTitle()) $$render(consequent);
					});
				}

				var node_7 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Card.Base, ($$anchor, Card_Base) => {
							Card_Base($$anchor, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											direction: 'row',
											justifyContent: 'center',
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_1();
												var node_10 = $.first_child(fragment_7);

												Spinner(node_10, {});
												$.next();
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					};

					var d = $.derived(() => ['waiting', 'processing'].includes($.get(effectiveStatus)) || $.get(effectiveStatus) === 'building' && !$$props.deployment?.buildLogs?.length);

					var alternate = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_11 = $.first_child(fragment_8);

						$.key(node_11, () => $$props.deployment.buildLogs, ($$anchor) => {
							{
								let $0 = $.derived(() => !hideScrollButtons());
								let $1 = $.derived(() => $$props.deployment.buildLogs || setCopy());

								Logs($$anchor, {
									get fullHeight() {
										return fullHeight();
									},

									get height() {
										return height();
									},

									get showScrollButton() {
										return $.get($0);
									},

									get logs() {
										return $.get($1);
									},

									get theme() {
										return $app().themeInUse;
									},

									set theme($$value) {
										$.store_mutate(app, $.untrack($app).themeInUse = $$value, $.untrack($app));
									}
								});
							}
						});

						$.append($$anchor, fragment_8);
					};

					$.if(node_7, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
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