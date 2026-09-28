import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/components/ui/accordion/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Sheet from "$lib/components/ui/sheet/index.js";
import * as Checkbox from "$lib/components/ui/checkbox/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import ShieldIcon from "@lucide/svelte/icons/shield";
import PlusIcon from "@lucide/svelte/icons/plus";
import LockIcon from "@lucide/svelte/icons/lock";
import KeyIcon from "@lucide/svelte/icons/key";
import UsersIcon from "@lucide/svelte/icons/users";
import PencilIcon from "@lucide/svelte/icons/pencil";
import CopyIcon from "@lucide/svelte/icons/copy";
import TrashIcon from "@lucide/svelte/icons/trash-2";
import UserMinusIcon from "@lucide/svelte/icons/user-minus";
import UserPlusIcon from "@lucide/svelte/icons/user-plus";
import { toast } from "svelte-sonner";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let currentUser = $.derived(() => data.userDb);
		let userPermissions = $.derived(() => data.userPermissions);

		function hasPermission(perm) {
			return userPermissions().includes(perm);
		}

		// State
		let loading = true;

		let roles = [];
		let allPermissions = [];
		let allUsers = [];

		// Create role dialog
		let showCreateDialog = false;

		let creatingRole = false;
		let createError = "";
		let newRole = { role_id: "", name: "" };
		let createPermissionMode = "pick";
		let cloneFromRoleId = "";

		// Delete role dialog
		let showDeleteDialog = false;

		let deletingRole = false;
		let roleToDelete = null;
		let deleteAction = "remove";
		let deleteTargetRoleId = "";

		// Edit role dialog
		let showEditDialog = false;

		let editingRole = false;
		let editError = "";
		let roleToEdit = null;
		let editRole = { name: "", status: "ACTIVE" };

		// Permissions sheet
		let showPermissionsSheet = false;

		let permissionsRole = null;
		let rolePermissionIds = new Set();
		let savingPermissions = false;
		let loadingPermissions = false;

		// Users sheet
		let showUsersSheet = false;

		let usersRole = null;
		let roleUsers = [];
		let loadingUsers = false;
		let addingUserId = null;
		let removingUserId = null;
		const apiUrl = clientResolver(resolve, "/manage/api");

		async function apiCall(action, data = {}) {
			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, data })
			});

			const result = await res.json();

			if (result.error) throw new Error(result.error);

			return result;
		}

		async function fetchRoles() {
			loading = true;

			try {
				const result = await apiCall("getRoles");

				roles = result;
			} catch {
				toast.error("Failed to load roles");
			} finally {
				loading = false;
			}
		}

		async function fetchAllPermissions() {
			try {
				allPermissions = await apiCall("getAllPermissions");
			} catch {
				toast.error("Failed to load permissions");
			}
		}

		async function fetchAllUsers() {
			try {
				const result = await apiCall("getUsers", { page: 1, limit: 1000 });

				allUsers = result.users || [];
			} catch {
				toast.error("Failed to load users");
			}
		}

		function openCreateDialog(prefill) {
			if (prefill) {
				newRole = { role_id: prefill.role_id, name: prefill.name };
				createPermissionMode = "clone";
				cloneFromRoleId = prefill.cloneFromRoleId;
			} else {
				newRole = { role_id: "", name: "" };
				createPermissionMode = "pick";
				cloneFromRoleId = "";
			}

			createError = "";
			showCreateDialog = true;
		}

		// Create role
		async function handleCreateRole() {
			createError = "";

			if (!newRole.role_id.trim()) {
				createError = "Role ID is required";

				return;
			}

			if (!newRole.name.trim()) {
				createError = "Role name is required";

				return;
			}

			if (createPermissionMode === "clone" && !cloneFromRoleId) {
				createError = "Please select a role to clone permissions from";

				return;
			}

			creatingRole = true;

			try {
				const created = await apiCall("createRole", { role_id: newRole.role_id, name: newRole.name });

				// Clone permissions if selected
				if (createPermissionMode === "clone" && cloneFromRoleId) {
					const sourcePerms = await apiCall("getRolePermissions", { roleId: cloneFromRoleId });
					const permIds = sourcePerms.map((p) => p.permissions_id);

					if (permIds.length > 0) {
						await apiCall("updateRolePermissions", {
							roleId: newRole.role_id.trim().toLowerCase().replace(/\s+/g, "_"),
							permissionIds: permIds
						});
					}
				}

				toast.success("Role created");
				showCreateDialog = false;

				const createdRoleId = newRole.role_id.trim().toLowerCase().replace(/\s+/g, "_");

				newRole = { role_id: "", name: "" };
				cloneFromRoleId = "";
				createPermissionMode = "pick";
				await fetchRoles();

				// Open permissions sheet for the newly created role
				const createdRole = roles.find((r) => r.id === createdRoleId);

				if (createdRole) {
					openPermissions(createdRole);
				}
			} catch(e) {
				createError = e instanceof Error ? e.message : "Failed to create role";
			} finally {
				creatingRole = false;
			}
		}

		// Delete role
		async function handleDeleteRole() {
			if (!roleToDelete) return;

			deletingRole = true;

			try {
				const options = deleteAction === "migrate"
					? { action: "migrate", targetRoleId: deleteTargetRoleId }
					: { action: "remove" };

				await apiCall("deleteRole", { roleId: roleToDelete.id, options });
				toast.success("Role deleted");
				showDeleteDialog = false;
				roleToDelete = null;
				await fetchRoles();
			} catch(e) {
				toast.error(e instanceof Error ? e.message : "Failed to delete role");
			} finally {
				deletingRole = false;
			}
		}

		// Edit role
		function openEditDialog(role) {
			roleToEdit = role;
			editRole = { name: role.role_name, status: role.status };
			editError = "";
			showEditDialog = true;
		}

		async function handleEditRole() {
			if (!roleToEdit) return;

			editError = "";

			if (!editRole.name.trim()) {
				editError = "Role name is required";

				return;
			}

			editingRole = true;

			try {
				await apiCall("updateRole", {
					roleId: roleToEdit.id,
					name: editRole.name,
					status: editRole.status
				});

				toast.success("Role updated");
				showEditDialog = false;
				roleToEdit = null;
				await fetchRoles();
			} catch(e) {
				editError = e instanceof Error ? e.message : "Failed to update role";
			} finally {
				editingRole = false;
			}
		}

		// Open permissions sheet
		async function openPermissions(role) {
			permissionsRole = role;
			rolePermissionIds = new Set();
			showPermissionsSheet = true;
			loadingPermissions = true;

			try {
				const perms = await apiCall("getRolePermissions", { roleId: role.id });

				rolePermissionIds = new Set(perms.map((p) => p.permissions_id));
			} catch {
				toast.error("Failed to load permissions");
			} finally {
				loadingPermissions = false;
			}
		}

		// Save permissions
		async function savePermissions() {
			if (!permissionsRole) return;

			savingPermissions = true;

			try {
				await apiCall("updateRolePermissions", {
					roleId: permissionsRole.id,
					permissionIds: Array.from(rolePermissionIds)
				});

				toast.success("Permissions updated");
				showPermissionsSheet = false;
			} catch(e) {
				toast.error(e instanceof Error ? e.message : "Failed to update permissions");
			} finally {
				savingPermissions = false;
			}
		}

		function togglePermission(permId) {
			const next = new Set(rolePermissionIds);

			if (next.has(permId)) {
				next.delete(permId);
			} else {
				next.add(permId);
			}

			rolePermissionIds = next;
		}

		// Open users sheet
		async function openUsers(role) {
			usersRole = role;
			roleUsers = [];
			showUsersSheet = true;
			loadingUsers = true;

			try {
				const canAssign = hasPermission("roles.assign_users");

				const [users] = await Promise.all([
					apiCall("getRoleUsers", { roleId: role.id }),
					canAssign ? fetchAllUsers() : Promise.resolve()
				]);

				roleUsers = users;
			} catch {
				toast.error("Failed to load role users");
			} finally {
				loadingUsers = false;
			}
		}

		// Add user to role
		async function addUser(userId) {
			if (!usersRole) return;

			addingUserId = userId;

			try {
				await apiCall("addUserToRole", { roleId: usersRole.id, userId });
				toast.success("User added to role");
				roleUsers = await apiCall("getRoleUsers", { roleId: usersRole.id });
			} catch(e) {
				toast.error(e instanceof Error ? e.message : "Failed to add user");
			} finally {
				addingUserId = null;
			}
		}

		// Remove user from role
		async function removeUser(userId) {
			if (!usersRole) return;

			removingUserId = userId;

			try {
				await apiCall("removeUserFromRole", { roleId: usersRole.id, userId });
				toast.success("User removed from role");
				roleUsers = await apiCall("getRoleUsers", { roleId: usersRole.id });
			} catch(e) {
				toast.error(e instanceof Error ? e.message : "Failed to remove user");
			} finally {
				removingUserId = null;
			}
		}

		let groupedPermissions = $.derived(() => {
			const groups = [];
			const groupMap = new Map();

			for (const perm of allPermissions) {
				const dotIndex = perm.id.indexOf(".");
				const group = dotIndex > -1 ? perm.id.substring(0, dotIndex) : perm.id;

				if (!groupMap.has(group)) groupMap.set(group, []);

				groupMap.get(group).push(perm);
			}

			for (const [group, perms] of groupMap) {
				const label = group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

				groups.push({ group, label, permissions: perms });
			}

			return groups;
		});

		function groupGrantedCount(perms) {
			return perms.filter((p) => rolePermissionIds.has(p.id)).length;
		}

		let availableUsersToAdd = $.derived(() => allUsers.filter((u) => !roleUsers.some((ru) => ru.id === u.id)));

		onMount(async () => {
			await Promise.all([fetchRoles(), fetchAllPermissions()]);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="kener-manage flex flex-1 flex-col gap-4 p-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2">`);
			ShieldIcon($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <h2 class="text-xl font-semibold">Roles</h2></div> `);

			if (hasPermission("roles.write")) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					onclick: () => openCreateDialog(),
					children: ($$renderer) => {
						PlusIcon($$renderer, { class: 'mr-1 h-4 w-4' });
						$$renderer.push(`<!----> Create Role`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div>`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center p-8">`);
				Spinner($$renderer, { class: 'h-6 w-6' });
				$$renderer.push(`<!----></div>`);
			} else if (roles.length === 0) {
				$$renderer.push(`<!--[1--><div class="text-muted-foreground p-8 text-center text-sm">No roles found</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="ktable overflow-hidden rounded-xl border">`);

				if (Table.Root) {
					$$renderer.push('<!--[-->');

					Table.Root($$renderer, {
						children: ($$renderer) => {
							if (Table.Header) {
								$$renderer.push('<!--[-->');

								Table.Header($$renderer, {
									children: ($$renderer) => {
										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Head) {
														$$renderer.push('<!--[-->');

														Table.Head($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Role ID`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Head) {
														$$renderer.push('<!--[-->');

														Table.Head($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Name`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Head) {
														$$renderer.push('<!--[-->');

														Table.Head($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Status`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Head) {
														$$renderer.push('<!--[-->');

														Table.Head($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Type`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Head) {
														$$renderer.push('<!--[-->');
														Table.Head($$renderer, { class: 'text-right' });
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

							if (Table.Body) {
								$$renderer.push('<!--[-->');

								Table.Body($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(roles);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let role = each_array[$$index];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																class: 'font-mono text-sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(role.id)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(role.role_name)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	Badge($$renderer, {
																		variant: role.status === "ACTIVE" ? "default" : "secondary",
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(role.status)}`);
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

														$$renderer.push(` `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	if (role.readonly === 1) {
																		$$renderer.push('<!--[0-->');

																		Badge($$renderer, {
																			variant: 'outline',
																			children: ($$renderer) => {
																				LockIcon($$renderer, { class: 'mr-1 h-3 w-3' });
																				$$renderer.push(`<!----> Readonly`);
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');

																		Badge($$renderer, {
																			variant: 'outline',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Custom`);
																			},
																			$$slots: { default: true }
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

														$$renderer.push(` `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																class: 'text-right',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex items-center justify-end gap-1">`);

																	Button($$renderer, {
																		variant: 'ghost',
																		size: 'sm',
																		onclick: () => openPermissions(role),
																		children: ($$renderer) => {
																			KeyIcon($$renderer, { class: 'mr-1 h-4 w-4' });
																			$$renderer.push(`<!----> Permissions`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		variant: 'ghost',
																		size: 'sm',
																		onclick: () => openUsers(role),
																		children: ($$renderer) => {
																			UsersIcon($$renderer, { class: 'mr-1 h-4 w-4' });
																			$$renderer.push(`<!----> Users`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	if (hasPermission("roles.write")) {
																		$$renderer.push('<!--[0-->');

																		Button($$renderer, {
																			variant: 'ghost',
																			size: 'sm',
																			title: 'Duplicate',
																			onclick: () => openCreateDialog({
																				role_id: role.id + "-copy",
																				name: role.role_name + " Copy",
																				cloneFromRoleId: role.id
																			}),

																			children: ($$renderer) => {
																				CopyIcon($$renderer, { class: 'h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> `);

																	if (role.readonly !== 1 && hasPermission("roles.write")) {
																		$$renderer.push('<!--[0-->');

																		Button($$renderer, {
																			variant: 'ghost',
																			size: 'sm',
																			onclick: () => openEditDialog(role),
																			children: ($$renderer) => {
																				PencilIcon($$renderer, { class: 'h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Button($$renderer, {
																			variant: 'ghost',
																			size: 'sm',
																			onclick: () => {
																				roleToDelete = role;
																				deleteAction = "remove";
																				deleteTargetRoleId = "";
																				showDeleteDialog = true;
																			},

																			children: ($$renderer) => {
																				TrashIcon($$renderer, { class: 'text-destructive h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--></div>`);
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

				$$renderer.push(`</div>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showEditDialog;
					},

					set open($$value) {
						showEditDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Edit Role`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Update <span class="font-semibold">${$.escape(roleToEdit?.role_name)}</span> role.`);
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

									$$renderer.push(` <div class="grid gap-4 py-4"><div class="grid gap-2">`);

									Label($$renderer, {
										for: 'edit-role-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Role Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'edit-role-name',
										get value() {
											return editRole.name;
										},

										set value($$value) {
											editRole.name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="grid gap-2">`);

									Label($$renderer, {
										for: 'edit-role-status',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Status`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									$$renderer.select(
										{
											id: 'edit-role-status',
											class: 'border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm',
											value: editRole.status
										},
										($$renderer) => {
											$$renderer.option({ value: 'ACTIVE' }, ($$renderer) => {
												$$renderer.push(`Active`);
											});

											$$renderer.option({ value: 'INACTIVE' }, ($$renderer) => {
												$$renderer.push(`Inactive`);
											});
										}
									);

									$$renderer.push(`</div> `);

									if (editError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(editError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => showEditDialog = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													onclick: handleEditRole,
													disabled: editingRole,
													children: ($$renderer) => {
														if (editingRole) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'mr-2 h-4 w-4' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Save`);
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showCreateDialog;
					},

					set open($$value) {
						showCreateDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Create Role`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Create a new custom role with its own permissions.`);
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

									$$renderer.push(` <div class="grid gap-4 py-4"><div class="grid gap-2">`);

									Label($$renderer, {
										for: 'role-id',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Role ID`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'role-id',
										placeholder: 'e.g. viewer',
										get value() {
											return newRole.role_id;
										},

										set value($$value) {
											newRole.role_id = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Lowercase letters, numbers, underscores, hyphens only.</p></div> <div class="grid gap-2">`);

									Label($$renderer, {
										for: 'role-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Role Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'role-name',
										placeholder: 'e.g. Viewer',
										get value() {
											return newRole.name;
										},

										set value($$value) {
											newRole.name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="grid gap-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Permissions`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex gap-2">`);

									Button($$renderer, {
										variant: createPermissionMode === "pick" ? "default" : "outline",
										size: 'sm',
										onclick: () => {
											createPermissionMode = "pick";
											cloneFromRoleId = "";
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Pick after creation`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: createPermissionMode === "clone" ? "default" : "outline",
										size: 'sm',
										onclick: () => createPermissionMode = "clone",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Clone from existing role`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div> `);

									if (createPermissionMode === "clone") {
										$$renderer.push(`<!--[0--><div class="grid gap-2">`);

										Label($$renderer, {
											for: 'clone-role',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Clone permissions from`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										$$renderer.select(
											{
												id: 'clone-role',
												class: 'border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm',
												value: cloneFromRoleId
											},
											($$renderer) => {
												$$renderer.option({ value: '' }, ($$renderer) => {
													$$renderer.push(`Select a role...`);
												});

												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(roles.filter((r) => r.status === "ACTIVE"));

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let r = each_array_1[$$index_1];

													$$renderer.option({ value: r.id }, ($$renderer) => {
														$$renderer.push(`${$.escape(r.role_name)}`);
													});
												}

												$$renderer.push(`<!--]-->`);
											}
										);

										$$renderer.push(`</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (createError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(createError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => showCreateDialog = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													onclick: handleCreateRole,
													disabled: creatingRole,
													children: ($$renderer) => {
														if (creatingRole) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'mr-2 h-4 w-4' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Create`);
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showDeleteDialog;
					},

					set open($$value) {
						showDeleteDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete Role`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure you want to delete <span class="font-semibold">${$.escape(roleToDelete?.role_name)}</span>?`);
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

									$$renderer.push(` <div class="grid gap-4 py-4"><div class="grid gap-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->What should happen to users in this role?`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex gap-2">`);

									Button($$renderer, {
										variant: deleteAction === "remove" ? "default" : "outline",
										size: 'sm',
										onclick: () => deleteAction = "remove",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Remove assignments`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: deleteAction === "migrate" ? "default" : "outline",
										size: 'sm',
										onclick: () => deleteAction = "migrate",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Migrate to another role`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div> `);

									if (deleteAction === "migrate") {
										$$renderer.push(`<!--[0--><div class="grid gap-2">`);

										Label($$renderer, {
											for: 'target-role',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Target Role`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										$$renderer.select(
											{
												id: 'target-role',
												class: 'border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm',
												value: deleteTargetRoleId
											},
											($$renderer) => {
												$$renderer.option({ value: '' }, ($$renderer) => {
													$$renderer.push(`Select a role...`);
												});

												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like(roles.filter((r) => r.id !== roleToDelete?.id && r.status === "ACTIVE"));

												for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
													let r = each_array_2[$$index_2];

													$$renderer.option({ value: r.id }, ($$renderer) => {
														$$renderer.push(`${$.escape(r.role_name)}`);
													});
												}

												$$renderer.push(`<!--]-->`);
											}
										);

										$$renderer.push(`</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => showDeleteDialog = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'destructive',
													onclick: handleDeleteRole,
													disabled: deletingRole || deleteAction === "migrate" && !deleteTargetRoleId,
													children: ($$renderer) => {
														if (deletingRole) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'mr-2 h-4 w-4' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Delete`);
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

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					get open() {
						return showPermissionsSheet;
					},

					set open($$value) {
						showPermissionsSheet = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								side: 'right',
								class: 'w-full overflow-y-auto sm:max-w-lg',
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Permissions — ${$.escape(permissionsRole?.role_name)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
														children: ($$renderer) => {
															if (permissionsRole?.readonly === 1) {
																$$renderer.push(`<!--[0-->This is a readonly role. Permissions cannot be modified.`);
															} else {
																$$renderer.push(`<!--[-1-->Toggle permissions for this role.`);
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

									$$renderer.push(` <div class="p-4">`);

									if (loadingPermissions) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center p-8">`);
										Spinner($$renderer, { class: 'h-6 w-6' });
										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="rounded-xl border">`);

										if (Accordion.Root) {
											$$renderer.push('<!--[-->');

											Accordion.Root($$renderer, {
												type: 'multiple',
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_3 = $.ensure_array_like(groupedPermissions());

													for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
														let group = each_array_3[$$index_4];
														const granted = groupGrantedCount(group.permissions);

														if (Accordion.Item) {
															$$renderer.push('<!--[-->');

															Accordion.Item($$renderer, {
																value: group.group,
																children: ($$renderer) => {
																	if (Accordion.Trigger) {
																		$$renderer.push('<!--[-->');

																		Accordion.Trigger($$renderer, {
																			class: 'px-4',
																			children: ($$renderer) => {
																				$$renderer.push(`<div><span class="capitalize">${$.escape(group.label)}</span> `);

																				Badge($$renderer, {
																					variant: granted === group.permissions.length ? "default" : granted > 0 ? "secondary" : "outline",
																					class: 'ml-2',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(granted)}/${$.escape(group.permissions.length)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----></div>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Accordion.Content) {
																		$$renderer.push('<!--[-->');

																		Accordion.Content($$renderer, {
																			class: 'px-4',
																			children: ($$renderer) => {
																				$$renderer.push(`<div class="flex flex-col gap-2 pt-0"><!--[-->`);

																				const each_array_4 = $.ensure_array_like(group.permissions);

																				for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
																					let perm = each_array_4[$$index_3];

																					Button($$renderer, {
																						variant: rolePermissionIds.has(perm.id) ? "outline" : "ghost",
																						class: `h-auto justify-start gap-3 p-3 text-left ${rolePermissionIds.has(perm.id) ? 'border-primary bg-primary/5' : ''}`,
																						disabled: permissionsRole?.readonly === 1 || !hasPermission("roles.assign_permissions"),
																						onclick: () => togglePermission(perm.id),
																						children: ($$renderer) => {
																							if (Checkbox.Root) {
																								$$renderer.push('<!--[-->');

																								Checkbox.Root($$renderer, {
																									checked: rolePermissionIds.has(perm.id),
																									disabled: permissionsRole?.readonly === 1 || !hasPermission("roles.assign_permissions")
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` <div class="flex flex-col"><span class="text-sm font-medium">${$.escape(perm.permission_name)}</span></div>`);
																						},
																						$$slots: { default: true }
																					});
																				}

																				$$renderer.push(`<!--]--></div>`);
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

										$$renderer.push(`</div> `);

										if (permissionsRole?.readonly !== 1 && hasPermission("roles.assign_permissions")) {
											$$renderer.push(`<!--[0--><div class="flex justify-end gap-2 p-4">`);

											Button($$renderer, {
												variant: 'outline',
												onclick: () => showPermissionsSheet = false,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Cancel`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												onclick: savePermissions,
												disabled: savingPermissions,
												children: ($$renderer) => {
													if (savingPermissions) {
														$$renderer.push('<!--[0-->');
														Spinner($$renderer, { class: 'mr-2 h-4 w-4' });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> Save Permissions`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]--></div>`);
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

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					get open() {
						return showUsersSheet;
					},

					set open($$value) {
						showUsersSheet = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								side: 'right',
								class: 'w-full overflow-y-auto sm:max-w-lg',
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Users — ${$.escape(usersRole?.role_name)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Manage users assigned to this role.`);
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

									if (loadingUsers) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center p-8">`);
										Spinner($$renderer, { class: 'h-6 w-6' });
										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="p-4"><h4 class="mb-2 text-sm font-medium">Current Users (${$.escape(roleUsers.length)})</h4> `);

										if (roleUsers.length === 0) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">No users assigned to this role.</p>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="flex flex-col gap-2"><!--[-->`);

											const each_array_5 = $.ensure_array_like(roleUsers);

											for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
												let user = each_array_5[$$index_5];

												$$renderer.push(`<div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col"><span class="text-sm font-medium">${$.escape(user.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(user.email)}</span></div> `);

												if (hasPermission("roles.assign_users")) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														disabled: removingUserId === user.id,
														onclick: () => removeUser(user.id),
														children: ($$renderer) => {
															if (removingUserId === user.id) {
																$$renderer.push('<!--[0-->');
																Spinner($$renderer, { class: 'h-4 w-4' });
															} else {
																$$renderer.push('<!--[-1-->');
																UserMinusIcon($$renderer, { class: 'text-destructive h-4 w-4' });
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]--></div> `);

										if (hasPermission("roles.assign_users")) {
											$$renderer.push('<!--[0-->');
											Separator($$renderer, {});
											$$renderer.push(`<!----> <div class="p-4"><h4 class="mb-2 text-sm font-medium">Add Users</h4> `);

											if (availableUsersToAdd().length === 0) {
												$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">All users are already in this role.</p>`);
											} else {
												$$renderer.push(`<!--[-1--><div class="flex max-h-64 flex-col gap-2 overflow-y-auto"><!--[-->`);

												const each_array_6 = $.ensure_array_like(availableUsersToAdd());

												for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
													let user = each_array_6[$$index_6];

													$$renderer.push(`<div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col"><span class="text-sm font-medium">${$.escape(user.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(user.email)}</span></div> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														disabled: addingUserId === user.id,
														onclick: () => addUser(user.id),
														children: ($$renderer) => {
															if (addingUserId === user.id) {
																$$renderer.push('<!--[0-->');
																Spinner($$renderer, { class: 'h-4 w-4' });
															} else {
																$$renderer.push('<!--[-1-->');
																UserPlusIcon($$renderer, { class: 'h-4 w-4' });
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												}

												$$renderer.push(`<!--]--></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}