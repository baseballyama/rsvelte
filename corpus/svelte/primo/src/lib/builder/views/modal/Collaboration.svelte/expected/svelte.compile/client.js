import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Share the following link to invited user: <pre class="link svelte-1ch7xb9"> </pre>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`You are about to remove collaborator <strong> </strong> from the site.`, 1);
var root_3 = $.from_html(`<div class="animate-spin absolute"><!></div>`);
var root_4 = $.from_html(`<button type="submit" value="email" class="svelte-1ch7xb9"><!></button> <span>or</span>`, 1);
var root_5 = $.from_html(`<output class="error svelte-1ch7xb9"> </output>`);
var root_6 = $.from_html(`<span>Loading...</span>`);
var root_7 = $.from_html(`<span> </span> <span> </span>`, 1);
var root_8 = $.from_html(`<span> </span>`);
var root_9 = $.from_html(`<li class="svelte-1ch7xb9"><!> <span class="email svelte-1ch7xb9"><!></span> <span class="role"> </span> <span class="remove-action" title="User with a server role cannot be removed from the site"><!></span></li>`);
var root_10 = $.from_html(`<li class="svelte-1ch7xb9"><!> <span class="email svelte-1ch7xb9"><!></span> <span class="role"> </span> <span class="remove-action" title="Remove the site collaborator"><!></span></li>`);
var root_11 = $.from_html(`<ul class="svelte-1ch7xb9"><!> <!></ul>`);
var root_12 = $.from_html(`<!> <!> <!> <div class="Invitation svelte-1ch7xb9"><main class="svelte-1ch7xb9"><h2 class="svelte-1ch7xb9">Invite site collaborator</h2> <form class="svelte-1ch7xb9"><label class="subheading svelte-1ch7xb9" for="email">Enter collaborator email</label> <div class="svelte-1ch7xb9"><div class="input-group svelte-1ch7xb9"><input type="email" placeholder="Email address" name="email" required="" class="svelte-1ch7xb9"/> <select required="" class="svelte-1ch7xb9"><option>Developer</option><option>Content Editor</option></select></div></div> <div class="svelte-1ch7xb9"><!> <button type="submit" value="link" class="svelte-1ch7xb9"><!></button> <!></div></form> <section><h3 class="subheading svelte-1ch7xb9">People with Access</h3> <!></section></main></div>`, 1);

export default function Collaboration($$anchor, $$props) {
	$.push($$props, true);

	let sending = $.state(false);
	let generating = $.state(false);
	let error = $.state('');
	let link = $.state('');
	let link_shown = $.state(false);
	let email = $.state('');
	let role = $.state('developer');

	async function invite_collaborator() {
		try {
			const stillLoading = !$.get(users) || !$.get(server_members) || !$.get(site_collborators);

			if (stillLoading) {
				$.set(error, 'Not ready');

				throw new Error('Still loading');
			}

			$.set(sending, true);
			$.set(error, '');

			const hasSiteAccess = [
				...$.get(server_members),
				...$.get(site_collborators).map(({ user }) => user)
			].some((user) => user?.email === $.get(email));

			if (hasSiteAccess) {
				$.set(error, 'Collaborator already exists');

				throw new Error('Collaborator already exists');
			}

			const password = nanoid(30);

			const user = $.get(users).find((user) => user.email === $.get(email)) ?? Users.create({
				email: $.get(email),
				password,
				passwordConfirm: password,
				invite: 'pending'
			});

			SiteRoleAssignments.create({ site: $$props.site.id, user: user.id, role: $.get(role) });
			await self.commit();
			$.set(email, '');
			$.set(role, 'developer');
		} catch(e) {
			if (!$.get(error)) $.set(error, 'Unexpected error');

			throw e;
		} finally {
			$.set(sending, false);
		}
	}

	async function generate_link() {
		try {
			const stillLoading = !$.get(users) || !$.get(server_members) || !$.get(site_collborators);

			if (stillLoading) {
				$.set(error, 'Not ready');

				throw new Error('Still loading');
			}

			$.set(generating, true);
			$.set(error, '');
			$.set(link, '');
			$.set(link_shown, false);

			const hasSiteAccess = [
				...$.get(server_members),
				...$.get(site_collborators).map(({ user }) => user)
			].some((user) => user?.email === $.get(email));

			if (hasSiteAccess) {
				$.set(error, 'Collaborator already exists');

				throw new Error('Collaborator already exists');
			}

			const user = $.get(users).find((user) => user.email === $.get(email));

			if (user) {
				SiteRoleAssignments.create({ site: $$props.site.id, user: user.id, role: $.get(role) });
				await self.commit();
				$.set(email, '');
				$.set(role, 'developer');
				$.set(link, location.protocol + '//' + $$props.site.host + '/admin');
				$.set(link_shown, true);
			} else {
				const password = nanoid(30);
				const user = Users.create({ email: $.get(email), password, passwordConfirm: password });

				SiteRoleAssignments.create({ site: $$props.site.id, user: user.id, role: $.get(role) });
				await self.commit();
				$.set(email, '');
				$.set(role, 'developer');

				const response = await fetch(`${self.instance?.baseURL}/api/primo/password-link`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${self.instance?.authStore.token}`
					},
					body: JSON.stringify({ site_id: $$props.site.id, user_id: user.id })
				}).then((response) => {
					if (!response.ok) {
						$.set(error, 'Error generating link');

						throw new Error('Non-ok response');
					}

					return response.json();
				});

				$.set(link, response.link, true);
				$.set(link_shown, true);
			}
		} catch(e) {
			if (!$.get(error)) $.set(error, 'Unexpected error');

			throw e;
		} finally {
			$.set(generating, false);
		}
	}

	async function handle_role_assignment_delete() {
		if (!$.get(collaborator_to_remove)) return;

		$.set(removing_collaborator, true);
		SiteRoleAssignments.delete($.get(collaborator_to_remove).assignment.id);
		await self.commit();
		$.set(is_remove_collaborator_open, false);
		$.set(removing_collaborator, false);
		$.set(collaborator_to_remove, undefined);
	}

	let users = $.derived(() => Collaborators.list());
	let server_members = $.derived(() => $.get(users)?.filter(({ serverRole }) => !!serverRole));

	let site_collborators = $.derived(() => $$props.site.role_assignments()?.map((assignment) => ({
		assignment,
		user: $.get(users)?.find((user) => user.id === assignment.user)
	})).filter((collaborator) => !!collaborator.user));

	let is_remove_collaborator_open = $.state(false);

	// Per-site editor cap: 0/undefined means unlimited. Only "editor"-role
	// assignments count toward it (developers are not billed editor seats).
	// Enforced server-side in internal/limits.go; this disables the invite
	// affordance once this site is at its plan's per-site editor limit.
	let site_editor_count = $.derived(() => $$props.site.role_assignments()?.filter((a) => a.role === 'editor').length ?? 0);

	let at_editor_cap = $.derived(() => !!instance.editor_cap && $.get(site_editor_count) >= instance.editor_cap);
	let removing_collaborator = $.state(false);
	let collaborator_to_remove = $.state(void 0);
	const role_names = { developer: 'Developer', editor: 'Content Editor' };
	var fragment = root_12();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					$.set(link, '');
				}
			},

			get open() {
				return $.get(link_shown);
			},

			set open($$value) {
				$.set(link_shown, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Link to share');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root();
													var pre = $.sibling($.first_child(fragment_4));
													var text_1 = $.only_child(pre, true);

													$.template_effect(() => $.set_text(text_1, $.get(link)));
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

							var node_5 = $.sibling(node_2, 2);

							$.component(node_5, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Done');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
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

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => AlertDialog.Root, ($$anchor, AlertDialog_Root_1) => {
		AlertDialog_Root_1($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					$.set(removing_collaborator, false);
					$.set(collaborator_to_remove, undefined);
				}
			},

			get open() {
				return $.get(is_remove_collaborator_open);
			},

			set open($$value) {
				$.set(is_remove_collaborator_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_8 = $.first_child(fragment_6);

				$.component(node_8, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
					AlertDialog_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_1();
							var node_9 = $.first_child(fragment_7);

							$.component(node_9, () => AlertDialog.Header, ($$anchor, AlertDialog_Header_1) => {
								AlertDialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_10 = $.first_child(fragment_8);

										$.component(node_10, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
											AlertDialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Are you sure?');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
											AlertDialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_9 = root_2();
													var strong = $.sibling($.first_child(fragment_9));
													var text_4 = $.only_child(strong, true);

													$.next();
													$.template_effect(() => $.set_text(text_4, $.get(collaborator_to_remove)?.user.email));
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_9, 2);

							$.component(node_12, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer_1) => {
								AlertDialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_13 = $.first_child(fragment_10);

										$.component(node_13, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
											AlertDialog_Cancel_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Cancel');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: handle_role_assignment_delete,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_15 = $.first_child(fragment_11);

													{
														var consequent = ($$anchor) => {
															var div = root_3();
															var node_16 = $.child(div);

															Loader(node_16, {});
															$.reset(div);
															$.append($$anchor, div);
														};

														var alternate = ($$anchor) => {
															var text_6 = $.text();

															$.template_effect(() => $.set_text(text_6, `Remove ${$.get(collaborator_to_remove)?.user.email ?? ''}`));
															$.append($$anchor, text_6);
														};

														$.if(node_15, ($$render) => {
															if ($.get(removing_collaborator)) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

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

	var node_17 = $.sibling(node_7, 2);

	$.component(node_17, () => Dialog.Header, ($$anchor, Dialog_Header) => {
		Dialog_Header($$anchor, { title: 'Site Collaborators', icon: 'clarity:users-solid' });
	});

	var div_1 = $.sibling(node_17, 2);
	var main = $.child(div_1);
	var form = $.sibling($.child(main), 2);
	var div_2 = $.sibling($.child(form), 2);
	var div_3 = $.child(div_2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var select = $.sibling(input, 2);
	var option = $.child(select);

	option.value = option.__value = 'developer';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'editor';
	$.reset(select);
	$.init_select(select);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_18 = $.child(div_4);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_13 = root_4();
			var button = $.first_child(fragment_13);
			var node_19 = $.child(button);

			{
				var consequent_1 = ($$anchor) => {
					Icon($$anchor, { icon: 'eos-icons:three-dots-loading' });
				};

				var alternate_1 = ($$anchor) => {
					var text_7 = $.text('Send invite');

					$.append($$anchor, text_7);
				};

				$.if(node_19, ($$render) => {
					if ($.get(sending)) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(button);
			$.next(2);

			$.template_effect(() => {
				button.disabled = $.get(at_editor_cap);

				$.set_attribute(button, 'title', $.get(at_editor_cap)
					? 'Editor limit reached for your plan. Upgrade to add more editors.'
					: undefined);
			});

			$.append($$anchor, fragment_13);
		};

		$.if(node_18, ($$render) => {
			if (instance.smtp_enabled) $$render(consequent_2);
		});
	}

	var button_1 = $.sibling(node_18, 2);
	var node_20 = $.child(button_1);

	{
		var consequent_3 = ($$anchor) => {
			Icon($$anchor, { icon: 'eos-icons:three-dots-loading' });
		};

		var alternate_2 = ($$anchor) => {
			var text_8 = $.text('Generate link');

			$.append($$anchor, text_8);
		};

		$.if(node_20, ($$render) => {
			if ($.get(generating)) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.reset(button_1);

	var node_21 = $.sibling(button_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var output = root_5();
			var text_9 = $.only_child(output, true);

			$.template_effect(() => $.set_text(text_9, $.get(error)));
			$.append($$anchor, output);
		};

		$.if(node_21, ($$render) => {
			if ($.get(error)) $$render(consequent_4);
		});
	}

	$.reset(div_4);
	$.reset(form);

	var section = $.sibling(form, 2);
	var node_22 = $.sibling($.child(section), 2);

	{
		var consequent_5 = ($$anchor) => {
			var span = root_6();

			$.append($$anchor, span);
		};

		var alternate_5 = ($$anchor) => {
			var ul = root_11();
			var node_23 = $.child(ul);

			$.each(node_23, 17, () => $.get(server_members) ?? [], $.index, ($$anchor, $$item, $$index, $$array) => {
				let id = () => $.get($$item).id;
				let email = () => $.get($$item).email;
				let avatar = () => $.get($$item).avatar;
				let name = () => $.get($$item).name;
				let serverRole = () => $.get($$item).serverRole;
				var li = root_9();
				var node_24 = $.child(li);

				$.component(node_24, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						class: 'ring-background transition-all ring-2 size-[27px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_25 = $.first_child(fragment_16);

							{
								var consequent_6 = ($$anchor) => {
									var fragment_17 = $.comment();
									var node_26 = $.first_child(fragment_17);

									{
										let $0 = $.derived(() => avatar() && `${self.instance?.baseURL}/api/files/collaborators/${id()}/${avatar()}`);
										let $1 = $.derived(() => name() || email());

										$.component(node_26, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, {
												get src() {
													return $.get($0);
												},

												get alt() {
													return $.get($1);
												},
												class: 'object-cover object-center'
											});
										});
									}

									$.append($$anchor, fragment_17);
								};

								$.if(node_25, ($$render) => {
									if (avatar()) $$render(consequent_6);
								});
							}

							var node_27 = $.sibling(node_25, 2);

							$.component(node_27, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
								Avatar_Fallback($$anchor, {
									class: 'text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(($0) => $.set_text(text_10, $0), [() => (name() || email()).slice(0, 2).toUpperCase()]);
										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				var span_1 = $.sibling(node_24, 2);
				var node_28 = $.child(span_1);

				{
					var consequent_7 = ($$anchor) => {
						var fragment_19 = root_7();
						var span_2 = $.first_child(fragment_19);
						var text_11 = $.only_child(span_2, true);
						var span_3 = $.sibling(span_2, 2);
						var text_12 = $.only_child(span_3);

						$.template_effect(() => {
							$.set_text(text_11, name());
							$.set_text(text_12, `(${email() ?? ''})`);
						});

						$.append($$anchor, fragment_19);
					};

					var alternate_3 = ($$anchor) => {
						var span_4 = root_8();
						var text_13 = $.only_child(span_4, true);

						$.template_effect(() => $.set_text(text_13, email()));
						$.append($$anchor, span_4);
					};

					$.if(node_28, ($$render) => {
						if (name()) $$render(consequent_7); else $$render(alternate_3, -1);
					});
				}

				$.reset(span_1);

				var span_5 = $.sibling(span_1, 2);
				var text_14 = $.only_child(span_5, true);
				var span_6 = $.sibling(span_5, 2);
				var node_29 = $.child(span_6);

				Button(node_29, {
					type: 'button',
					variant: 'destructive',
					disabled: true,
					children: ($$anchor, $$slotProps) => {
						Icon($$anchor, { icon: 'ion:trash' });
					},
					$$slots: { default: true }
				});

				$.reset(span_6);
				$.reset(li);
				$.template_effect(() => $.set_text(text_14, role_names[serverRole() ?? 'none']));
				$.append($$anchor, li);
			});

			var node_30 = $.sibling(node_23, 2);

			$.each(node_30, 17, () => $.get(site_collborators) ?? [], $.index, ($$anchor, $$item) => {
				let user = () => $.get($$item).user;
				let assignment = () => $.get($$item).assignment;
				var li_1 = root_10();
				var node_31 = $.child(li_1);

				$.component(node_31, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
					Avatar_Root_1($$anchor, {
						class: 'ring-background transition-all ring-2 size-[27px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_1();
							var node_32 = $.first_child(fragment_21);

							{
								let $0 = $.derived(() => user().avatar && `${self.instance?.baseURL}/api/files/collaborators/${user().id}/${user().avatar}`);
								let $1 = $.derived(() => user().name || user().email);

								$.component(node_32, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
									Avatar_Image_1($$anchor, {
										get src() {
											return $.get($0);
										},

										get alt() {
											return $.get($1);
										},
										class: 'object-cover object-center'
									});
								});
							}

							var node_33 = $.sibling(node_32, 2);

							$.component(node_33, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
								Avatar_Fallback_1($$anchor, {
									class: 'text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_15 = $.text();

										$.template_effect(($0) => $.set_text(text_15, $0), [
											() => (user().name || user().email).slice(0, 2).toUpperCase()
										]);

										$.append($$anchor, text_15);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				});

				var span_7 = $.sibling(node_31, 2);
				var node_34 = $.child(span_7);

				{
					var consequent_8 = ($$anchor) => {
						var fragment_23 = root_7();
						var span_8 = $.first_child(fragment_23);
						var text_16 = $.only_child(span_8, true);
						var span_9 = $.sibling(span_8, 2);
						var text_17 = $.only_child(span_9);

						$.template_effect(() => {
							$.set_text(text_16, user().name);
							$.set_text(text_17, `(${user().email ?? ''})`);
						});

						$.append($$anchor, fragment_23);
					};

					var alternate_4 = ($$anchor) => {
						var span_10 = root_8();
						var text_18 = $.only_child(span_10, true);

						$.template_effect(() => $.set_text(text_18, user().email));
						$.append($$anchor, span_10);
					};

					$.if(node_34, ($$render) => {
						if (user().name) $$render(consequent_8); else $$render(alternate_4, -1);
					});
				}

				$.reset(span_7);

				var span_11 = $.sibling(span_7, 2);
				var text_19 = $.only_child(span_11, true);
				var span_12 = $.sibling(span_11, 2);
				var node_35 = $.child(span_12);

				Button(node_35, {
					type: 'button',
					variant: 'destructive',
					onclick: () => {
						$.set(collaborator_to_remove, { user: user(), assignment: assignment() }, true);
						$.set(is_remove_collaborator_open, true);
					},

					children: ($$anchor, $$slotProps) => {
						Icon($$anchor, { icon: 'ion:trash' });
					},
					$$slots: { default: true }
				});

				$.reset(span_12);
				$.reset(li_1);
				$.template_effect(() => $.set_text(text_19, role_names[assignment().role]));
				$.append($$anchor, li_1);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		};

		$.if(node_22, ($$render) => {
			if (!$.get(server_members) || !$.get(site_collborators)) $$render(consequent_5); else $$render(alternate_5, -1);
		});
	}

	$.reset(section);
	$.reset(main);
	$.reset(div_1);

	$.template_effect(() => {
		button_1.disabled = $.get(at_editor_cap);

		$.set_attribute(button_1, 'title', $.get(at_editor_cap)
			? 'Editor limit reached for your plan. Upgrade to add more editors.'
			: undefined);
	});

	$.event('submit', form, (e) => {
		e.preventDefault();

		if (!(e.submitter instanceof HTMLButtonElement)) {
			return;
		}

		const method = e.submitter.value;

		if (method === 'email') {
			invite_collaborator();
		} else if (method === 'link') {
			generate_link();
		}
	});

	$.bind_value(input, () => $.get(email), ($$value) => $.set(email, $$value));
	$.bind_select_value(select, () => $.get(role), ($$value) => $.set(role, $$value));
	$.append($$anchor, fragment);
	$.pop();
}