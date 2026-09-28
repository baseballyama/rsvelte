import * as $ from 'svelte/internal/server';
import { SiteRoleAssignment } from '$lib/common/models/SiteRoleAssignment';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import * as Avatar from '$lib/components/ui/avatar';
import { Button } from '$lib/components/ui/button';
import * as Dialog from '$lib/components/ui/dialog';
import { instance } from '$lib/instance';
import { Collaborators, SiteRoleAssignments, Users } from '$lib/pocketbase/collections';
import { self } from '$lib/pocketbase/managers';
import Icon from '@iconify/svelte';
import { Loader } from 'lucide-svelte';
import { nanoid } from 'nanoid';

export default function Collaboration($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { site } = $$props;
		let sending = false;
		let generating = false;
		let error = '';
		let link = '';
		let link_shown = false;
		let email = '';
		let role = 'developer';

		async function invite_collaborator() {
			try {
				const stillLoading = !users() || !server_members() || !site_collborators();

				if (stillLoading) {
					error = 'Not ready';

					throw new Error('Still loading');
				}

				sending = true;
				error = '';

				const hasSiteAccess = [
					...server_members(),
					...site_collborators().map(({ user }) => user)
				].some((user) => user?.email === email);

				if (hasSiteAccess) {
					error = 'Collaborator already exists';

					throw new Error('Collaborator already exists');
				}

				const password = nanoid(30);

				const user = users().find((user) => user.email === email) ?? Users.create({
					email,
					password,
					passwordConfirm: password,
					invite: 'pending'
				});

				SiteRoleAssignments.create({ site: site.id, user: user.id, role });
				await self.commit();
				email = '';
				role = 'developer';
			} catch(e) {
				if (!error) error = 'Unexpected error';

				throw e;
			} finally {
				sending = false;
			}
		}

		async function generate_link() {
			try {
				const stillLoading = !users() || !server_members() || !site_collborators();

				if (stillLoading) {
					error = 'Not ready';

					throw new Error('Still loading');
				}

				generating = true;
				error = '';
				link = '';
				link_shown = false;

				const hasSiteAccess = [
					...server_members(),
					...site_collborators().map(({ user }) => user)
				].some((user) => user?.email === email);

				if (hasSiteAccess) {
					error = 'Collaborator already exists';

					throw new Error('Collaborator already exists');
				}

				const user = users().find((user) => user.email === email);

				if (user) {
					SiteRoleAssignments.create({ site: site.id, user: user.id, role });
					await self.commit();
					email = '';
					role = 'developer';
					link = location.protocol + '//' + site.host + '/admin';
					link_shown = true;
				} else {
					const password = nanoid(30);
					const user = Users.create({ email, password, passwordConfirm: password });

					SiteRoleAssignments.create({ site: site.id, user: user.id, role });
					await self.commit();
					email = '';
					role = 'developer';

					const response = await fetch(`${self.instance?.baseURL}/api/primo/password-link`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${self.instance?.authStore.token}`
						},
						body: JSON.stringify({ site_id: site.id, user_id: user.id })
					}).then((response) => {
						if (!response.ok) {
							error = 'Error generating link';

							throw new Error('Non-ok response');
						}

						return response.json();
					});

					link = response.link;
					link_shown = true;
				}
			} catch(e) {
				if (!error) error = 'Unexpected error';

				throw e;
			} finally {
				generating = false;
			}
		}

		async function handle_role_assignment_delete() {
			if (!collaborator_to_remove) return;

			removing_collaborator = true;
			SiteRoleAssignments.delete(collaborator_to_remove.assignment.id);
			await self.commit();
			is_remove_collaborator_open = false;
			removing_collaborator = false;
			collaborator_to_remove = undefined;
		}

		let users = $.derived(() => Collaborators.list());
		let server_members = $.derived(() => users()?.filter(({ serverRole }) => !!serverRole));

		let site_collborators = $.derived(() => site.role_assignments()?.map((assignment) => ({
			assignment,
			user: users()?.find((user) => user.id === assignment.user)
		})).filter((collaborator) => !!collaborator.user));

		let is_remove_collaborator_open = false;

		// Per-site editor cap: 0/undefined means unlimited. Only "editor"-role
		// assignments count toward it (developers are not billed editor seats).
		// Enforced server-side in internal/limits.go; this disables the invite
		// affordance once this site is at its plan's per-site editor limit.
		let site_editor_count = $.derived(() => site.role_assignments()?.filter((a) => a.role === 'editor').length ?? 0);

		let at_editor_cap = $.derived(() => !!instance.editor_cap && site_editor_count() >= instance.editor_cap);
		let removing_collaborator = false;
		let collaborator_to_remove = void 0;
		const role_names = { developer: 'Developer', editor: 'Content Editor' };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							link = '';
						}
					},

					get open() {
						return link_shown;
					},

					set open($$value) {
						link_shown = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Link to share`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Share the following link to invited user: <pre class="link svelte-1ch7xb9">${$.escape(link)}</pre>`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Done`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							removing_collaborator = false;
							collaborator_to_remove = undefined;
						}
					},

					get open() {
						return is_remove_collaborator_open;
					},

					set open($$value) {
						is_remove_collaborator_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->You are about to remove collaborator <strong>${$.escape(collaborator_to_remove?.user.email)}</strong> from the site.`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: handle_role_assignment_delete,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (removing_collaborator) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Remove ${$.escape(collaborator_to_remove?.user.email)}`);
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Header) {
				$$renderer.push('<!--[-->');
				Dialog.Header($$renderer, { title: 'Site Collaborators', icon: 'clarity:users-solid' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div class="Invitation svelte-1ch7xb9"><main class="svelte-1ch7xb9"><h2 class="svelte-1ch7xb9">Invite site collaborator</h2> <form class="svelte-1ch7xb9"><label class="subheading svelte-1ch7xb9" for="email">Enter collaborator email</label> <div class="svelte-1ch7xb9"><div class="input-group svelte-1ch7xb9"><input${$.attr('value', email)} type="email" placeholder="Email address" name="email" required="" class="svelte-1ch7xb9"/> `);

			$$renderer.select(
				{ value: role, required: true, class: '' },
				($$renderer) => {
					$$renderer.option({ value: 'developer' }, ($$renderer) => {
						$$renderer.push(`Developer`);
					});

					$$renderer.option({ value: 'editor' }, ($$renderer) => {
						$$renderer.push(`Content Editor`);
					});
				},
				'svelte-1ch7xb9'
			);

			$$renderer.push(`</div></div> <div class="svelte-1ch7xb9">`);

			if (instance.smtp_enabled) {
				$$renderer.push(`<!--[0--><button type="submit" value="email"${$.attr('disabled', at_editor_cap(), true)}${$.attr('title', at_editor_cap()
					? 'Editor limit reached for your plan. Upgrade to add more editors.'
					: undefined)} class="svelte-1ch7xb9">`);

				if (sending) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { icon: 'eos-icons:three-dots-loading' });
				} else {
					$$renderer.push(`<!--[-1-->Send invite`);
				}

				$$renderer.push(`<!--]--></button> <span>or</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button type="submit" value="link"${$.attr('disabled', at_editor_cap(), true)}${$.attr('title', at_editor_cap()
				? 'Editor limit reached for your plan. Upgrade to add more editors.'
				: undefined)} class="svelte-1ch7xb9">`);

			if (generating) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: 'eos-icons:three-dots-loading' });
			} else {
				$$renderer.push(`<!--[-1-->Generate link`);
			}

			$$renderer.push(`<!--]--></button> `);

			if (error) {
				$$renderer.push(`<!--[0--><output class="error svelte-1ch7xb9">${$.escape(error)}</output>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></form> <section><h3 class="subheading svelte-1ch7xb9">People with Access</h3> `);

			if (!server_members() || !site_collborators()) {
				$$renderer.push(`<!--[0--><span>Loading...</span>`);
			} else {
				$$renderer.push(`<!--[-1--><ul class="svelte-1ch7xb9"><!--[-->`);

				const each_array = $.ensure_array_like(server_members() ?? []);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { id, email, avatar, name, serverRole } = each_array[$$index];

					$$renderer.push(`<li class="svelte-1ch7xb9">`);

					if (Avatar.Root) {
						$$renderer.push('<!--[-->');

						Avatar.Root($$renderer, {
							class: 'ring-background transition-all ring-2 size-[27px]',
							children: ($$renderer) => {
								if (avatar) {
									$$renderer.push('<!--[0-->');

									if (Avatar.Image) {
										$$renderer.push('<!--[-->');

										Avatar.Image($$renderer, {
											src: avatar && `${self.instance?.baseURL}/api/files/collaborators/${id}/${avatar}`,
											alt: name || email,
											class: 'object-cover object-center'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Avatar.Fallback) {
									$$renderer.push('<!--[-->');

									Avatar.Fallback($$renderer, {
										class: 'text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape((name || email).slice(0, 2).toUpperCase())}`);
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="email svelte-1ch7xb9">`);

					if (name) {
						$$renderer.push(`<!--[0--><span>${$.escape(name)}</span> <span>(${$.escape(email)})</span>`);
					} else {
						$$renderer.push(`<!--[-1--><span>${$.escape(email)}</span>`);
					}

					$$renderer.push(`<!--]--></span> <span class="role">${$.escape(role_names[serverRole ?? 'none'])}</span> <span class="remove-action" title="User with a server role cannot be removed from the site">`);

					Button($$renderer, {
						type: 'button',
						variant: 'destructive',
						disabled: true,
						children: ($$renderer) => {
							Icon($$renderer, { icon: 'ion:trash' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></span></li>`);
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_1 = $.ensure_array_like(site_collborators() ?? []);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let { user, assignment } = each_array_1[$$index_1];

					$$renderer.push(`<li class="svelte-1ch7xb9">`);

					if (Avatar.Root) {
						$$renderer.push('<!--[-->');

						Avatar.Root($$renderer, {
							class: 'ring-background transition-all ring-2 size-[27px]',
							children: ($$renderer) => {
								if (Avatar.Image) {
									$$renderer.push('<!--[-->');

									Avatar.Image($$renderer, {
										src: user.avatar && `${self.instance?.baseURL}/api/files/collaborators/${user.id}/${user.avatar}`,
										alt: user.name || user.email,
										class: 'object-cover object-center'
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Avatar.Fallback) {
									$$renderer.push('<!--[-->');

									Avatar.Fallback($$renderer, {
										class: 'text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape((user.name || user.email).slice(0, 2).toUpperCase())}`);
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="email svelte-1ch7xb9">`);

					if (user.name) {
						$$renderer.push(`<!--[0--><span>${$.escape(user.name)}</span> <span>(${$.escape(user.email)})</span>`);
					} else {
						$$renderer.push(`<!--[-1--><span>${$.escape(user.email)}</span>`);
					}

					$$renderer.push(`<!--]--></span> <span class="role">${$.escape(role_names[assignment.role])}</span> <span class="remove-action" title="Remove the site collaborator">`);

					Button($$renderer, {
						type: 'button',
						variant: 'destructive',
						onclick: () => {
							collaborator_to_remove = { user, assignment };
							is_remove_collaborator_open = true;
						},

						children: ($$renderer) => {
							Icon($$renderer, { icon: 'ion:trash' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></span></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			}

			$$renderer.push(`<!--]--></section></main></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}