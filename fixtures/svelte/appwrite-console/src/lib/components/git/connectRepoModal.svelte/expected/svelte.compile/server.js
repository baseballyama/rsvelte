import * as $ from 'svelte/internal/server';
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

export default function ConnectRepoModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			show = false,
			product,
			callbackState = null,
			onlyExisting = false,
			connect = async () => {}
		} = $$props;

		let repositoryBehaviour = onlyExisting ? 'existing' : undefined;
		let repositoryName = '';
		let repositoryPrivate = true;
		let selectedInstallationId = '';
		let selectedRepository = '';
		let installations = { installations: [], total: 0 };
		let error = '';

		onMount(async () => {
			installations = await sdk.forProject(page.params.region, page.params.project).vcs.listInstallations();

			if (!$.store_get($$store_subs ??= {}, '$installation', installation)?.$id && installations?.total) {
				$.store_set(installation, installations.installations[0]);
			}

			selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';

			if (installations?.total) {
				repositoryBehaviour = 'existing';
			}
		});

		async function connectRepo() {
			try {
				if (repositoryBehaviour === 'new') {
					const repo = await sdk.forProject(page.params.region, page.params.project).vcs.createRepository({
						installationId: $.store_get($$store_subs ??= {}, '$installation', installation).$id,
						name: repositoryName,
						xprivate: repositoryPrivate
					});

					repository.set(repo);
					selectedRepository = repo.id;
				}

				await connect(selectedInstallationId, selectedRepository);
				show = false;

				addNotification({
					type: 'success',
					message: 'Repository connected successfully'
				});
			} catch(e) {
				error = e.message;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Connect repository',
				hideFooter: !repositoryBehaviour,
				onSubmit: connectRepo,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (!!installations?.total) {
						$$renderer.push('<!--[0-->');

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xl',
								children: ($$renderer) => {
									if (!onlyExisting) {
										$$renderer.push('<!--[0-->');

										RepositoryBehaviour($$renderer, {
											get repositoryBehaviour() {
												return repositoryBehaviour;
											},

											set repositoryBehaviour($$value) {
												repositoryBehaviour = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (repositoryBehaviour === 'new') {
										$$renderer.push('<!--[0-->');

										NewRepository($$renderer, {
											installations,
											get repositoryName() {
												return repositoryName;
											},

											set repositoryName($$value) {
												repositoryName = $$value;
												$$settled = false;
											},

											get repositoryPrivate() {
												return repositoryPrivate;
											},

											set repositoryPrivate($$value) {
												repositoryPrivate = $$value;
												$$settled = false;
											},

											get selectedInstallationId() {
												return selectedInstallationId;
											},

											set selectedInstallationId($$value) {
												selectedInstallationId = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');

										Repositories($$renderer, {
											product,
											action: 'button',
											callbackState,
											connect: async (e) => {
												trackEvent(Click.ConnectRepositoryClick, { from: product });
												repository.set(e);
												repositoryName = e.name;
												selectedRepository = e.id;

												if (!selectedInstallationId && $.store_get($$store_subs ??= {}, '$installation', installation)?.$id) {
													selectedInstallationId = $.store_get($$store_subs ??= {}, '$installation', installation).$id;
												}

												try {
													await connect(selectedInstallationId, e.id);
													show = false;

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
												return selectedRepository;
											},

											set selectedRepository($$value) {
												selectedRepository = $$value;
												$$settled = false;
											}
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
						ConnectGit($$renderer, { callbackState });
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						$$renderer.push(`<span slot="description">Connect your ${$.escape(product === 'functions' ? 'function' : 'site')} to an existing repository or create
        a new one.</span>`);
					},

					footer: ($$renderer) => {
						{
							if (repositoryBehaviour === 'existing') {
								$$renderer.push('<!--[0-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										children: ($$renderer) => {
											Link($$renderer, {
												variant: 'quiet',
												href: connectGitHub(callbackState).toString(),
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															gap: 'xs',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Missing a repository? check your permissions `);
																Icon($$renderer, { icon: IconArrowSmRight });
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else if (repositoryBehaviour === 'new') {
								$$renderer.push('<!--[1-->');

								Button($$renderer, {
									text: true,
									size: 's',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									size: 's',
									submit: true,
									disabled: !repositoryName || !$.store_get($$store_subs ??= {}, '$installation', installation)?.$id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}