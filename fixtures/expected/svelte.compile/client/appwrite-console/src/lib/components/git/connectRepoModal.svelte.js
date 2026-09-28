import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import { installation, repository } from '$lib/stores/vcs';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
import { Link } from '$lib/elements';
import { NewRepository, Repositories } from '$lib/components/git';
import ConnectGit from '$lib/components/git/connectGit.svelte';
import { addNotification } from '$lib/stores/notifications';
import { Click, trackEvent } from '$lib/actions/analytics';
import RepositoryBehaviour from '$lib/components/git/repositoryBehaviour.svelte';
import { page } from '$app/state';
import { connectGitHub } from '$lib/stores/git';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span slot="description"> </span>`);
var root_2 = $.from_html(`Missing a repository? check your permissions <!>`, 1);

export default function ConnectRepoModal($$anchor, $$props) {
	$.push($$props, true);

	const $installation = () => $.store_get(installation, '$installation', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		callbackState = $.prop($$props, 'callbackState', 3, null),
		onlyExisting = $.prop($$props, 'onlyExisting', 3, false),
		connect = $.prop($$props, 'connect', 3, async () => {});

	let repositoryBehaviour = $.state($.proxy(onlyExisting() ? 'existing' : undefined));
	let repositoryName = $.state('');
	let repositoryPrivate = $.state(true);
	let selectedInstallationId = $.state('');
	let selectedRepository = $.state('');
	let installations = $.state($.proxy({ installations: [], total: 0 }));
	let error = $.state('');

	onMount(async () => {
		$.set(installations, await sdk.forProject(page.params.region, page.params.project).vcs.listInstallations(), true);

		if (!$installation()?.$id && $.get(installations)?.total) {
			$.store_set(installation, $.get(installations).installations[0]);
		}

		$.set(selectedInstallationId, $.get(installations).total ? $.get(installations).installations[0]?.$id : '', true);

		if ($.get(installations)?.total) {
			$.set(repositoryBehaviour, 'existing');
		}
	});

	$.user_effect(() => {
		if ($installation()?.$id) {
			$.set(selectedInstallationId, $installation().$id, true);
		}
	});

	async function connectRepo() {
		try {
			if ($.get(repositoryBehaviour) === 'new') {
				const repo = await sdk.forProject(page.params.region, page.params.project).vcs.createRepository({
					installationId: $installation().$id,
					name: $.get(repositoryName),
					xprivate: $.get(repositoryPrivate)
				});

				repository.set(repo);
				$.set(selectedRepository, repo.id, true);
			}

			await connect()($.get(selectedInstallationId), $.get(selectedRepository));
			show(false);

			addNotification({
				type: 'success',
				message: 'Repository connected successfully'
			});
		} catch(e) {
			$.set(error, e.message, true);
		}
	}

	{
		let $0 = $.derived(() => !$.get(repositoryBehaviour));

		Modal($$anchor, {
			title: 'Connect repository',
			get hideFooter() {
				return $.get($0);
			},
			onSubmit: connectRepo,
			get show() {
				return show();
			},

			set show($$value) {
				show($$value);
			},

			get error() {
				return $.get(error);
			},

			set error($$value) {
				$.set(error, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											RepositoryBehaviour($$anchor, {
												get repositoryBehaviour() {
													return $.get(repositoryBehaviour);
												},

												set repositoryBehaviour($$value) {
													$.set(repositoryBehaviour, $$value, true);
												}
											});
										};

										$.if(node_2, ($$render) => {
											if (!onlyExisting()) $$render(consequent);
										});
									}

									var node_3 = $.sibling(node_2, 2);

									{
										var consequent_1 = ($$anchor) => {
											NewRepository($$anchor, {
												get installations() {
													return $.get(installations);
												},

												get repositoryName() {
													return $.get(repositoryName);
												},

												set repositoryName($$value) {
													$.set(repositoryName, $$value, true);
												},

												get repositoryPrivate() {
													return $.get(repositoryPrivate);
												},

												set repositoryPrivate($$value) {
													$.set(repositoryPrivate, $$value, true);
												},

												get selectedInstallationId() {
													return $.get(selectedInstallationId);
												},

												set selectedInstallationId($$value) {
													$.set(selectedInstallationId, $$value, true);
												}
											});
										};

										var alternate = ($$anchor) => {
											Repositories($$anchor, {
												get product() {
													return $$props.product;
												},
												action: 'button',
												get callbackState() {
													return callbackState();
												},

												connect: async (e) => {
													trackEvent(Click.ConnectRepositoryClick, { from: $$props.product });
													repository.set(e);
													$.set(repositoryName, e.name, true);
													$.set(selectedRepository, e.id, true);

													if (!$.get(selectedInstallationId) && $installation()?.$id) {
														$.set(selectedInstallationId, $installation().$id, true);
													}

													try {
														await connect()($.get(selectedInstallationId), e.id);
														show(false);

														addNotification({
															type: 'success',
															message: 'Repository connected successfully'
														});
													} catch(error) {
														addNotification({
															type: 'error',
															message: error?.message ?? 'Failed to connect repository'
														});
													}
												},

												get selectedRepository() {
													return $.get(selectedRepository);
												},

												set selectedRepository($$value) {
													$.set(selectedRepository, $$value, true);
												}
											});
										};

										$.if(node_3, ($$render) => {
											if ($.get(repositoryBehaviour) === 'new') $$render(consequent_1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					var alternate_1 = ($$anchor) => {
						ConnectGit($$anchor, {
							get callbackState() {
								return callbackState();
							}
						});
					};

					$.if(node, ($$render) => {
						if (!!$.get(installations)?.total) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				description: ($$anchor, $$slotProps) => {
					var span = root_1();
					var text = $.only_child(span);

					$.template_effect(() => $.set_text(text, `Connect your ${$$props.product === 'functions' ? 'function' : 'site'} to an existing repository or create
        a new one.`));

					$.append($$anchor, span);
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_4 = $.first_child(fragment_8);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_9 = $.comment();
							var node_5 = $.first_child(fragment_9);

							$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => connectGitHub(callbackState()).toString());

											Link($$anchor, {
												variant: 'quiet',
												get href() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_6 = $.first_child(fragment_11);

													$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															direction: 'row',
															gap: 'xs',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_12 = root_2();
																var node_7 = $.sibling($.first_child(fragment_12));

																Icon(node_7, {
																	get icon() {
																		return IconArrowSmRight;
																	}
																});

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						};

						var consequent_4 = ($$anchor) => {
							var fragment_13 = root();
							var node_8 = $.first_child(fragment_13);

							Button(node_8, {
								text: true,
								size: 's',
								$$events: { click: () => show(false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Cancel');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => !$.get(repositoryName) || !$installation()?.$id);

								Button(node_9, {
									size: 's',
									submit: true,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Create');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_13);
						};

						$.if(node_4, ($$render) => {
							if ($.get(repositoryBehaviour) === 'existing') $$render(consequent_3); else if ($.get(repositoryBehaviour) === 'new') $$render(consequent_4, 1);
						});
					}

					$.append($$anchor, fragment_8);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}