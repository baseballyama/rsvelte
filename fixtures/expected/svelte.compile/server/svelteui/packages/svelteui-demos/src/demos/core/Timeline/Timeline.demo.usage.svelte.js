import * as $ from 'svelte/internal/server';
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

export default function Timeline_demo_usage($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Timeline($$renderer, {
				active: 1,
				bulletSize: 24,
				lineWidth: 2,
				children: ($$renderer) => {
					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							bullet: LightningBolt,
							title: 'New branch',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->You've created new branch`);

										Text($$renderer, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->fix-notifications`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> from master`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$renderer) => {
										$$renderer.push(`<!---->2 hours ago`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							bullet: Commit,
							title: 'Commits',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->You've pushed 23 commits to`);

										Text($$renderer, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->fix-notifications branch`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$renderer) => {
										$$renderer.push(`<!---->52 minutes ago`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							title: 'Pull request',
							bullet: GithubLogo,
							lineVariant: 'dashed',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->You've submitted a pull request`);

										Text($$renderer, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Fix incorrect notification message (#187)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$renderer) => {
										$$renderer.push(`<!---->34 minutes ago`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							title: 'Code review',
							bullet: EyeOpen,
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										Text($$renderer, {
											variant: 'link',
											root: 'span',
											href: '#',
											inherit: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Robert Gluesticker`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> left a code review
				on your pull request`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'xs',
									override: { marginTop: '4px' },
									children: ($$renderer) => {
										$$renderer.push(`<!---->12 minutes ago`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}