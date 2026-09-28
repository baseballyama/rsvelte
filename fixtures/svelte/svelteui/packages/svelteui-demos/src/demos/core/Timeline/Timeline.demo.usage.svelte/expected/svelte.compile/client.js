import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Text, Timeline } from '@svelteuidev/core';
import { Commit, EyeOpen, GithubLogo, LightningBolt } from 'radix-icons-svelte';

const code = `<script>
	import { Text, Timeline } from '@svelteuidev/core';
  import { Commit, EyeOpen, GithubLogo, LightningBolt } from 'radix-icons-svelte';
<\/script>

<Timeline active={1} bulletSize={24} lineWidth={2}>
	<Timeline.Item bullet={LightningBolt} title='New branch'>
		<Text color='dimmed' size='sm'>
			You&apos;ve created new branch<Text variant='link' root='span' href='#' inherit
				>fix-notifications</Text
			> from master</Text
		>
		<Text size='xs'>2 hours ago</Text>
	</Timeline.Item>

	<Timeline.Item bullet={Commit} title='Commits'>
		<Text color='dimmed' size='sm'
			>You&apos;ve pushed 23 commits to<Text variant='link' root='span' href='#' inherit
				>fix-notifications branch</Text
			></Text
		>
		<Text size='xs'>52 minutes ago</Text>
	</Timeline.Item>

	<Timeline.Item title='Pull request' bullet={GithubLogo} lineVariant='dashed'>
		<Text color='dimmed' size='sm'
			>You&apos;ve submitted a pull request<Text variant='link' root='span' href='#' inherit
				>Fix incorrect notification message (#187)</Text
			></Text
		>
		<Text size='xs'>34 minutes ago</Text>
	</Timeline.Item>

	<Timeline.Item title='Code review' bullet={EyeOpen}>
		<Text color='dimmed' size='sm'
			><Text variant='link' root='span' href='#' inherit>Robert Gluesticker</Text> left a code review on
			your pull request</Text
		>
		<Text size='xs'>12 minutes ago</Text>
	</Timeline.Item>
</Timeline>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`You&apos;ve created new branch<!> from master`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`You&apos;ve pushed 23 commits to<!>`, 1);
var root_3 = $.from_html(`You&apos;ve submitted a pull request<!>`, 1);

var root_4 = $.from_html(
	`<!> left a code review
				on your pull request`,
	1
);

var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Timeline_demo_usage($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				active: 1,
				bulletSize: 24,
				lineWidth: 2,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_5();
					var node = $.first_child(fragment_2);

					$.component(node, () => Timeline.Item, ($$anchor, Timeline_Item) => {
						Timeline_Item($$anchor, {
							get bullet() {
								return LightningBolt;
							},
							title: 'New branch',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								Text(node_1, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();
										var node_2 = $.sibling($.first_child(fragment_4));

										Text(node_2, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('fix-notifications');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_1, 2);

								Text(node_3, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('2 hours ago');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node, 2);

					$.component(node_4, () => Timeline.Item, ($$anchor, Timeline_Item_1) => {
						Timeline_Item_1($$anchor, {
							get bullet() {
								return Commit;
							},
							title: 'Commits',
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_5 = $.first_child(fragment_5);

								Text(node_5, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_6 = root_2();
										var node_6 = $.sibling($.first_child(fragment_6));

										Text(node_6, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('fix-notifications branch');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});

								var node_7 = $.sibling(node_5, 2);

								Text(node_7, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('52 minutes ago');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_4, 2);

					$.component(node_8, () => Timeline.Item, ($$anchor, Timeline_Item_2) => {
						Timeline_Item_2($$anchor, {
							title: 'Pull request',
							get bullet() {
								return GithubLogo;
							},
							lineVariant: 'dashed',
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root_1();
								var node_9 = $.first_child(fragment_7);

								Text(node_9, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_8 = root_3();
										var node_10 = $.sibling($.first_child(fragment_8));

										Text(node_10, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Fix incorrect notification message (#187)');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_9, 2);

								Text(node_11, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('34 minutes ago');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_8, 2);

					$.component(node_12, () => Timeline.Item, ($$anchor, Timeline_Item_3) => {
						Timeline_Item_3($$anchor, {
							title: 'Code review',
							get bullet() {
								return EyeOpen;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root_1();
								var node_13 = $.first_child(fragment_9);

								Text(node_13, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_4();
										var node_14 = $.first_child(fragment_10);

										Text(node_14, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Robert Gluesticker');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										$.next();
										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_13, 2);

								Text(node_15, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('12 minutes ago');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}