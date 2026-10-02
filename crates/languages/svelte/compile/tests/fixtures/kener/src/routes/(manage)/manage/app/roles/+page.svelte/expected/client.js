import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> Create Role`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-center p-8"><!></div>`);
var root_2 = $.from_html(`<div class="text-muted-foreground p-8 text-center text-sm">No roles found</div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> Readonly`, 1);
var root_5 = $.from_html(`<!> Permissions`, 1);
var root_6 = $.from_html(`<!> Users`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="flex items-center justify-end gap-1"><!> <!> <!> <!></div>`);
var root_9 = $.from_html(`<div class="ktable overflow-hidden rounded-xl border"><!></div>`);
var root_10 = $.from_html(`Update <span class="font-semibold"> </span> role.`, 1);
var root_11 = $.from_html(`<p class="text-destructive text-sm"> </p>`);
var root_12 = $.from_html(`<!> Save`, 1);
var root_13 = $.from_html(`<!> <div class="grid gap-4 py-4"><div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><!> <select id="edit-role-status" class="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"><option>Active</option><option>Inactive</option></select></div> <!></div> <!>`, 1);
var root_14 = $.from_html(`<option> </option>`);
var root_15 = $.from_html(`<div class="grid gap-2"><!> <select id="clone-role" class="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"><option>Select a role...</option><!></select></div>`);
var root_16 = $.from_html(`<!> Create`, 1);
var root_17 = $.from_html(`<!> <div class="grid gap-4 py-4"><div class="grid gap-2"><!> <!> <p class="text-muted-foreground text-xs">Lowercase letters, numbers, underscores, hyphens only.</p></div> <div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><!> <div class="flex gap-2"><!> <!></div></div> <!> <!></div> <!>`, 1);
var root_18 = $.from_html(`Are you sure you want to delete <span class="font-semibold"> </span>?`, 1);
var root_19 = $.from_html(`<div class="grid gap-2"><!> <select id="target-role" class="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"><option>Select a role...</option><!></select></div>`);
var root_20 = $.from_html(`<!> Delete`, 1);
var root_21 = $.from_html(`<!> <div class="grid gap-4 py-4"><div class="grid gap-2"><!> <div class="flex gap-2"><!> <!></div></div> <!></div> <!>`, 1);
var root_22 = $.from_html(`<div><span class="capitalize"> </span> <!></div>`);
var root_23 = $.from_html(`<!> <div class="flex flex-col"><span class="text-sm font-medium"> </span></div>`, 1);
var root_24 = $.from_html(`<div class="flex flex-col gap-2 pt-0"></div>`);
var root_25 = $.from_html(`<!> Save Permissions`, 1);
var root_26 = $.from_html(`<div class="flex justify-end gap-2 p-4"><!> <!></div>`);
var root_27 = $.from_html(`<div class="rounded-xl border"><!></div> <!>`, 1);
var root_28 = $.from_html(`<!> <div class=" p-4"><!></div>`, 1);
var root_29 = $.from_html(`<p class="text-muted-foreground text-sm">No users assigned to this role.</p>`);
var root_30 = $.from_html(`<div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col"><span class="text-sm font-medium"> </span> <span class="text-muted-foreground text-xs"> </span></div> <!></div>`);
var root_31 = $.from_html(`<div class="flex flex-col gap-2"></div>`);
var root_32 = $.from_html(`<p class="text-muted-foreground text-sm">All users are already in this role.</p>`);
var root_33 = $.from_html(`<div class="flex max-h-64 flex-col gap-2 overflow-y-auto"></div>`);
var root_34 = $.from_html(`<!> <div class="p-4"><h4 class="mb-2 text-sm font-medium">Add Users</h4> <!></div>`, 1);
var root_35 = $.from_html(`<div class="p-4"><h4 class="mb-2 text-sm font-medium"> </h4> <!></div> <!>`, 1);
var root_36 = $.from_html(`<div class="kener-manage flex flex-1 flex-col gap-4 p-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <h2 class="text-xl font-semibold">Roles</h2></div> <!></div> <div><!></div></div> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let currentUser = $.derived(() => $$props.data.userDb);
	let userPermissions = $.derived(() => $$props.data.userPermissions);

	function hasPermission(perm) {
		return $.get(userPermissions).includes(perm);
	}

	// State
	let loading = $.state(true);

	let roles = $.state($.proxy([]));
	let allPermissions = $.state($.proxy([]));
	let allUsers = $.state($.proxy([]));

	// Create role dialog
	let showCreateDialog = $.state(false);

	let creatingRole = $.state(false);
	let createError = $.state("");
	let newRole = $.state($.proxy({ role_id: "", name: "" }));
	let createPermissionMode = $.state("pick");
	let cloneFromRoleId = $.state("");

	// Delete role dialog
	let showDeleteDialog = $.state(false);

	let deletingRole = $.state(false);
	let roleToDelete = $.state(null);
	let deleteAction = $.state("remove");
	let deleteTargetRoleId = $.state("");

	// Edit role dialog
	let showEditDialog = $.state(false);

	let editingRole = $.state(false);
	let editError = $.state("");
	let roleToEdit = $.state(null);
	let editRole = $.state($.proxy({ name: "", status: "ACTIVE" }));

	// Permissions sheet
	let showPermissionsSheet = $.state(false);

	let permissionsRole = $.state(null);
	let rolePermissionIds = $.state($.proxy(new Set()));
	let savingPermissions = $.state(false);
	let loadingPermissions = $.state(false);

	// Users sheet
	let showUsersSheet = $.state(false);

	let usersRole = $.state(null);
	let roleUsers = $.state($.proxy([]));
	let loadingUsers = $.state(false);
	let addingUserId = $.state(null);
	let removingUserId = $.state(null);
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
		$.set(loading, true);

		try {
			const result = await apiCall("getRoles");

			$.set(roles, result, true);
		} catch {
			toast.error("Failed to load roles");
		} finally {
			$.set(loading, false);
		}
	}

	async function fetchAllPermissions() {
		try {
			$.set(allPermissions, await apiCall("getAllPermissions"), true);
		} catch {
			toast.error("Failed to load permissions");
		}
	}

	async function fetchAllUsers() {
		try {
			const result = await apiCall("getUsers", { page: 1, limit: 1000 });

			$.set(allUsers, result.users || [], true);
		} catch {
			toast.error("Failed to load users");
		}
	}

	function openCreateDialog(prefill) {
		if (prefill) {
			$.set(newRole, { role_id: prefill.role_id, name: prefill.name }, true);
			$.set(createPermissionMode, "clone");
			$.set(cloneFromRoleId, prefill.cloneFromRoleId, true);
		} else {
			$.set(newRole, { role_id: "", name: "" }, true);
			$.set(createPermissionMode, "pick");
			$.set(cloneFromRoleId, "");
		}

		$.set(createError, "");
		$.set(showCreateDialog, true);
	}

	// Create role
	async function handleCreateRole() {
		$.set(createError, "");

		if (!$.get(newRole).role_id.trim()) {
			$.set(createError, "Role ID is required");

			return;
		}

		if (!$.get(newRole).name.trim()) {
			$.set(createError, "Role name is required");

			return;
		}

		if ($.get(createPermissionMode) === "clone" && !$.get(cloneFromRoleId)) {
			$.set(createError, "Please select a role to clone permissions from");

			return;
		}

		$.set(creatingRole, true);

		try {
			const created = await apiCall("createRole", { role_id: $.get(newRole).role_id, name: $.get(newRole).name });

			// Clone permissions if selected
			if ($.get(createPermissionMode) === "clone" && $.get(cloneFromRoleId)) {
				const sourcePerms = await apiCall("getRolePermissions", { roleId: $.get(cloneFromRoleId) });
				const permIds = sourcePerms.map((p) => p.permissions_id);

				if (permIds.length > 0) {
					await apiCall("updateRolePermissions", {
						roleId: $.get(newRole).role_id.trim().toLowerCase().replace(/\s+/g, "_"),
						permissionIds: permIds
					});
				}
			}

			toast.success("Role created");
			$.set(showCreateDialog, false);

			const createdRoleId = $.get(newRole).role_id.trim().toLowerCase().replace(/\s+/g, "_");

			$.set(newRole, { role_id: "", name: "" }, true);
			$.set(cloneFromRoleId, "");
			$.set(createPermissionMode, "pick");
			await fetchRoles();

			// Open permissions sheet for the newly created role
			const createdRole = $.get(roles).find((r) => r.id === createdRoleId);

			if (createdRole) {
				openPermissions(createdRole);
			}
		} catch(e) {
			$.set(createError, e instanceof Error ? e.message : "Failed to create role", true);
		} finally {
			$.set(creatingRole, false);
		}
	}

	// Delete role
	async function handleDeleteRole() {
		if (!$.get(roleToDelete)) return;

		$.set(deletingRole, true);

		try {
			const options = $.get(deleteAction) === "migrate"
				? { action: "migrate", targetRoleId: $.get(deleteTargetRoleId) }
				: { action: "remove" };

			await apiCall("deleteRole", { roleId: $.get(roleToDelete).id, options });
			toast.success("Role deleted");
			$.set(showDeleteDialog, false);
			$.set(roleToDelete, null);
			await fetchRoles();
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to delete role");
		} finally {
			$.set(deletingRole, false);
		}
	}

	// Edit role
	function openEditDialog(role) {
		$.set(roleToEdit, role, true);
		$.set(editRole, { name: role.role_name, status: role.status }, true);
		$.set(editError, "");
		$.set(showEditDialog, true);
	}

	async function handleEditRole() {
		if (!$.get(roleToEdit)) return;

		$.set(editError, "");

		if (!$.get(editRole).name.trim()) {
			$.set(editError, "Role name is required");

			return;
		}

		$.set(editingRole, true);

		try {
			await apiCall("updateRole", {
				roleId: $.get(roleToEdit).id,
				name: $.get(editRole).name,
				status: $.get(editRole).status
			});

			toast.success("Role updated");
			$.set(showEditDialog, false);
			$.set(roleToEdit, null);
			await fetchRoles();
		} catch(e) {
			$.set(editError, e instanceof Error ? e.message : "Failed to update role", true);
		} finally {
			$.set(editingRole, false);
		}
	}

	// Open permissions sheet
	async function openPermissions(role) {
		$.set(permissionsRole, role, true);
		$.set(rolePermissionIds, new Set(), true);
		$.set(showPermissionsSheet, true);
		$.set(loadingPermissions, true);

		try {
			const perms = await apiCall("getRolePermissions", { roleId: role.id });

			$.set(rolePermissionIds, new Set(perms.map((p) => p.permissions_id)), true);
		} catch {
			toast.error("Failed to load permissions");
		} finally {
			$.set(loadingPermissions, false);
		}
	}

	// Save permissions
	async function savePermissions() {
		if (!$.get(permissionsRole)) return;

		$.set(savingPermissions, true);

		try {
			await apiCall("updateRolePermissions", {
				roleId: $.get(permissionsRole).id,
				permissionIds: Array.from($.get(rolePermissionIds))
			});

			toast.success("Permissions updated");
			$.set(showPermissionsSheet, false);
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to update permissions");
		} finally {
			$.set(savingPermissions, false);
		}
	}

	function togglePermission(permId) {
		const next = new Set($.get(rolePermissionIds));

		if (next.has(permId)) {
			next.delete(permId);
		} else {
			next.add(permId);
		}

		$.set(rolePermissionIds, next, true);
	}

	// Open users sheet
	async function openUsers(role) {
		$.set(usersRole, role, true);
		$.set(roleUsers, [], true);
		$.set(showUsersSheet, true);
		$.set(loadingUsers, true);

		try {
			const canAssign = hasPermission("roles.assign_users");

			const [users] = await Promise.all([
				apiCall("getRoleUsers", { roleId: role.id }),
				canAssign ? fetchAllUsers() : Promise.resolve()
			]);

			$.set(roleUsers, users, true);
		} catch {
			toast.error("Failed to load role users");
		} finally {
			$.set(loadingUsers, false);
		}
	}

	// Add user to role
	async function addUser(userId) {
		if (!$.get(usersRole)) return;

		$.set(addingUserId, userId, true);

		try {
			await apiCall("addUserToRole", { roleId: $.get(usersRole).id, userId });
			toast.success("User added to role");
			$.set(roleUsers, await apiCall("getRoleUsers", { roleId: $.get(usersRole).id }), true);
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to add user");
		} finally {
			$.set(addingUserId, null);
		}
	}

	// Remove user from role
	async function removeUser(userId) {
		if (!$.get(usersRole)) return;

		$.set(removingUserId, userId, true);

		try {
			await apiCall("removeUserFromRole", { roleId: $.get(usersRole).id, userId });
			toast.success("User removed from role");
			$.set(roleUsers, await apiCall("getRoleUsers", { roleId: $.get(usersRole).id }), true);
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to remove user");
		} finally {
			$.set(removingUserId, null);
		}
	}

	let groupedPermissions = $.derived(() => {
		const groups = [];
		const groupMap = new Map();

		for (const perm of $.get(allPermissions)) {
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
		return perms.filter((p) => $.get(rolePermissionIds).has(p.id)).length;
	}

	let availableUsersToAdd = $.derived(() => $.get(allUsers).filter((u) => !$.get(roleUsers).some((ru) => ru.id === u.id)));

	onMount(async () => {
		await Promise.all([fetchRoles(), fetchAllPermissions()]);
	});

	var fragment = root_36();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	ShieldIcon(node, { class: 'h-5 w-5' });
	$.next(2);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				onclick: () => openCreateDialog(),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					PlusIcon(node_2, { class: 'mr-1 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => hasPermission("roles.write"));

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_3 = $.child(div_3);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var node_4 = $.child(div_4);

			Spinner(node_4, { class: 'h-6 w-6' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		var consequent_2 = ($$anchor) => {
			var div_5 = root_2();

			$.append($$anchor, div_5);
		};

		var alternate_1 = ($$anchor) => {
			var div_6 = root_9();
			var node_5 = $.child(div_6);

			$.component(node_5, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_7();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_3();
												var node_8 = $.first_child(fragment_5);

												$.component(node_8, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Role ID');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Name');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Status');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Type');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Table.Head, ($$anchor, Table_Head_4) => {
													Table_Head_4($$anchor, { class: 'text-right' });
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_6, 2);

						$.component(node_13, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_14 = $.first_child(fragment_6);

									$.each(node_14, 17, () => $.get(roles), (role) => role.id, ($$anchor, role) => {
										var fragment_7 = $.comment();
										var node_15 = $.first_child(fragment_7);

										$.component(node_15, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_3();
													var node_16 = $.first_child(fragment_8);

													$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'font-mono text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, $.get(role).id));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(() => $.set_text(text_5, $.get(role).role_name));
																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => $.get(role).status === "ACTIVE" ? "default" : "secondary");

																	Badge($$anchor, {
																		get variant() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text();

																			$.template_effect(() => $.set_text(text_6, $.get(role).status));
																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_20 = $.first_child(fragment_13);

																{
																	var consequent_3 = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'outline',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = root_4();
																				var node_21 = $.first_child(fragment_15);

																				LockIcon(node_21, { class: 'mr-1 h-3 w-3' });
																				$.next();
																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		});
																	};

																	var alternate = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'outline',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_7 = $.text('Custom');

																				$.append($$anchor, text_7);
																			},
																			$$slots: { default: true }
																		});
																	};

																	$.if(node_20, ($$render) => {
																		if ($.get(role).readonly === 1) $$render(consequent_3); else $$render(alternate, -1);
																	});
																}

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_19, 2);

													$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																var div_7 = root_8();
																var node_23 = $.child(div_7);

																Button(node_23, {
																	variant: 'ghost',
																	size: 'sm',
																	onclick: () => openPermissions($.get(role)),
																	children: ($$anchor, $$slotProps) => {
																		var fragment_17 = root_5();
																		var node_24 = $.first_child(fragment_17);

																		KeyIcon(node_24, { class: 'mr-1 h-4 w-4' });
																		$.next();
																		$.append($$anchor, fragment_17);
																	},
																	$$slots: { default: true }
																});

																var node_25 = $.sibling(node_23, 2);

																Button(node_25, {
																	variant: 'ghost',
																	size: 'sm',
																	onclick: () => openUsers($.get(role)),
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = root_6();
																		var node_26 = $.first_child(fragment_18);

																		UsersIcon(node_26, { class: 'mr-1 h-4 w-4' });
																		$.next();
																		$.append($$anchor, fragment_18);
																	},
																	$$slots: { default: true }
																});

																var node_27 = $.sibling(node_25, 2);

																{
																	var consequent_4 = ($$anchor) => {
																		Button($$anchor, {
																			variant: 'ghost',
																			size: 'sm',
																			title: 'Duplicate',
																			onclick: () => openCreateDialog({
																				role_id: $.get(role).id + "-copy",
																				name: $.get(role).role_name + " Copy",
																				cloneFromRoleId: $.get(role).id
																			}),

																			children: ($$anchor, $$slotProps) => {
																				CopyIcon($$anchor, { class: 'h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});
																	};

																	var d_1 = $.derived(() => hasPermission("roles.write"));

																	$.if(node_27, ($$render) => {
																		if ($.get(d_1)) $$render(consequent_4);
																	});
																}

																var node_28 = $.sibling(node_27, 2);

																{
																	var consequent_5 = ($$anchor) => {
																		var fragment_21 = root_7();
																		var node_29 = $.first_child(fragment_21);

																		Button(node_29, {
																			variant: 'ghost',
																			size: 'sm',
																			onclick: () => openEditDialog($.get(role)),
																			children: ($$anchor, $$slotProps) => {
																				PencilIcon($$anchor, { class: 'h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});

																		var node_30 = $.sibling(node_29, 2);

																		Button(node_30, {
																			variant: 'ghost',
																			size: 'sm',
																			onclick: () => {
																				$.set(roleToDelete, $.get(role), true);
																				$.set(deleteAction, "remove");
																				$.set(deleteTargetRoleId, "");
																				$.set(showDeleteDialog, true);
																			},

																			children: ($$anchor, $$slotProps) => {
																				TrashIcon($$anchor, { class: 'text-destructive h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});

																		$.append($$anchor, fragment_21);
																	};

																	var d_2 = $.derived(() => $.get(role).readonly !== 1 && hasPermission("roles.write"));

																	$.if(node_28, ($$render) => {
																		if ($.get(d_2)) $$render(consequent_5);
																	});
																}

																$.reset(div_7);
																$.append($$anchor, div_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_3, ($$render) => {
			if ($.get(loading)) $$render(consequent_1); else if ($.get(roles).length === 0) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_3);
	$.reset(div);

	var node_31 = $.sibling(div, 2);

	$.component(node_31, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showEditDialog);
			},

			set open($$value) {
				$.set(showEditDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_24 = $.comment();
				var node_32 = $.first_child(fragment_24);

				$.component(node_32, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_25 = root_13();
							var node_33 = $.first_child(fragment_25);

							$.component(node_33, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_26 = root_7();
										var node_34 = $.first_child(fragment_26);

										$.component(node_34, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Edit Role');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_34, 2);

										$.component(node_35, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_27 = root_10();
													var span = $.sibling($.first_child(fragment_27));
													var text_9 = $.only_child(span, true);

													$.next();
													$.template_effect(() => $.set_text(text_9, $.get(roleToEdit)?.role_name));
													$.append($$anchor, fragment_27);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_26);
									},
									$$slots: { default: true }
								});
							});

							var div_8 = $.sibling(node_33, 2);
							var div_9 = $.child(div_8);
							var node_36 = $.child(div_9);

							Label(node_36, {
								for: 'edit-role-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Role Name');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_37 = $.sibling(node_36, 2);

							Input(node_37, {
								id: 'edit-role-name',
								get value() {
									return $.get(editRole).name;
								},

								set value($$value) {
									$.get(editRole).name = $$value;
								}
							});

							$.reset(div_9);

							var div_10 = $.sibling(div_9, 2);
							var node_38 = $.child(div_10);

							Label(node_38, {
								for: 'edit-role-status',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Status');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							var select = $.sibling(node_38, 2);
							var option = $.child(select);

							option.value = option.__value = 'ACTIVE';

							var option_1 = $.sibling(option);

							option_1.value = option_1.__value = 'INACTIVE';
							$.reset(select);
							$.init_select(select);
							$.reset(div_10);

							var node_39 = $.sibling(div_10, 2);

							{
								var consequent_6 = ($$anchor) => {
									var p_1 = root_11();
									var text_12 = $.only_child(p_1, true);

									$.template_effect(() => $.set_text(text_12, $.get(editError)));
									$.append($$anchor, p_1);
								};

								$.if(node_39, ($$render) => {
									if ($.get(editError)) $$render(consequent_6);
								});
							}

							$.reset(div_8);

							var node_40 = $.sibling(div_8, 2);

							$.component(node_40, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_28 = root_7();
										var node_41 = $.first_child(fragment_28);

										Button(node_41, {
											variant: 'outline',
											onclick: () => $.set(showEditDialog, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Cancel');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});

										var node_42 = $.sibling(node_41, 2);

										Button(node_42, {
											onclick: handleEditRole,
											get disabled() {
												return $.get(editingRole);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_29 = root_12();
												var node_43 = $.first_child(fragment_29);

												{
													var consequent_7 = ($$anchor) => {
														Spinner($$anchor, { class: 'mr-2 h-4 w-4' });
													};

													$.if(node_43, ($$render) => {
														if ($.get(editingRole)) $$render(consequent_7);
													});
												}

												$.next();
												$.append($$anchor, fragment_29);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_28);
									},
									$$slots: { default: true }
								});
							});

							$.bind_select_value(select, () => $.get(editRole).status, ($$value) => $.get(editRole).status = $$value);
							$.append($$anchor, fragment_25);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_24);
			},
			$$slots: { default: true }
		});
	});

	var node_44 = $.sibling(node_31, 2);

	$.component(node_44, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(showCreateDialog);
			},

			set open($$value) {
				$.set(showCreateDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_31 = $.comment();
				var node_45 = $.first_child(fragment_31);

				$.component(node_45, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_32 = root_17();
							var node_46 = $.first_child(fragment_32);

							$.component(node_46, () => Dialog.Header, ($$anchor, Dialog_Header_1) => {
								Dialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_33 = root_7();
										var node_47 = $.first_child(fragment_33);

										$.component(node_47, () => Dialog.Title, ($$anchor, Dialog_Title_1) => {
											Dialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Create Role');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});
										});

										var node_48 = $.sibling(node_47, 2);

										$.component(node_48, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
											Dialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Create a new custom role with its own permissions.');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_33);
									},
									$$slots: { default: true }
								});
							});

							var div_11 = $.sibling(node_46, 2);
							var div_12 = $.child(div_11);
							var node_49 = $.child(div_12);

							Label(node_49, {
								for: 'role-id',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('Role ID');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							var node_50 = $.sibling(node_49, 2);

							Input(node_50, {
								id: 'role-id',
								placeholder: 'e.g. viewer',
								get value() {
									return $.get(newRole).role_id;
								},

								set value($$value) {
									$.get(newRole).role_id = $$value;
								}
							});

							$.next(2);
							$.reset(div_12);

							var div_13 = $.sibling(div_12, 2);
							var node_51 = $.child(div_13);

							Label(node_51, {
								for: 'role-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Role Name');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_52 = $.sibling(node_51, 2);

							Input(node_52, {
								id: 'role-name',
								placeholder: 'e.g. Viewer',
								get value() {
									return $.get(newRole).name;
								},

								set value($$value) {
									$.get(newRole).name = $$value;
								}
							});

							$.reset(div_13);

							var div_14 = $.sibling(div_13, 2);
							var node_53 = $.child(div_14);

							Label(node_53, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Permissions');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var div_15 = $.sibling(node_53, 2);
							var node_54 = $.child(div_15);

							{
								let $0 = $.derived(() => $.get(createPermissionMode) === "pick" ? "default" : "outline");

								Button(node_54, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => {
										$.set(createPermissionMode, "pick");
										$.set(cloneFromRoleId, "");
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_19 = $.text('Pick after creation');

										$.append($$anchor, text_19);
									},
									$$slots: { default: true }
								});
							}

							var node_55 = $.sibling(node_54, 2);

							{
								let $0 = $.derived(() => $.get(createPermissionMode) === "clone" ? "default" : "outline");

								Button(node_55, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => $.set(createPermissionMode, "clone"),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_20 = $.text('Clone from existing role');

										$.append($$anchor, text_20);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_15);
							$.reset(div_14);

							var node_56 = $.sibling(div_14, 2);

							{
								var consequent_8 = ($$anchor) => {
									var div_16 = root_15();
									var node_57 = $.child(div_16);

									Label(node_57, {
										for: 'clone-role',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Clone permissions from');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});

									var select_1 = $.sibling(node_57, 2);
									var option_2 = $.child(select_1);

									option_2.value = option_2.__value = '';

									var node_58 = $.sibling(option_2);

									$.each(node_58, 17, () => $.get(roles).filter((r) => r.status === "ACTIVE"), (r) => r.id, ($$anchor, r) => {
										var option_3 = root_14();
										var text_22 = $.only_child(option_3, true);
										var option_3_value = {};

										$.template_effect(() => {
											$.set_text(text_22, $.get(r).role_name);

											if (option_3_value !== (option_3_value = $.get(r).id)) {
												option_3.value = (option_3.__value = option_3_value) ?? '';
											}
										});

										$.append($$anchor, option_3);
									});

									$.reset(select_1);
									$.init_select(select_1);
									$.reset(div_16);
									$.bind_select_value(select_1, () => $.get(cloneFromRoleId), ($$value) => $.set(cloneFromRoleId, $$value));
									$.append($$anchor, div_16);
								};

								$.if(node_56, ($$render) => {
									if ($.get(createPermissionMode) === "clone") $$render(consequent_8);
								});
							}

							var node_59 = $.sibling(node_56, 2);

							{
								var consequent_9 = ($$anchor) => {
									var p_2 = root_11();
									var text_23 = $.only_child(p_2, true);

									$.template_effect(() => $.set_text(text_23, $.get(createError)));
									$.append($$anchor, p_2);
								};

								$.if(node_59, ($$render) => {
									if ($.get(createError)) $$render(consequent_9);
								});
							}

							$.reset(div_11);

							var node_60 = $.sibling(div_11, 2);

							$.component(node_60, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_34 = root_7();
										var node_61 = $.first_child(fragment_34);

										Button(node_61, {
											variant: 'outline',
											onclick: () => $.set(showCreateDialog, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_24 = $.text('Cancel');

												$.append($$anchor, text_24);
											},
											$$slots: { default: true }
										});

										var node_62 = $.sibling(node_61, 2);

										Button(node_62, {
											onclick: handleCreateRole,
											get disabled() {
												return $.get(creatingRole);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_35 = root_16();
												var node_63 = $.first_child(fragment_35);

												{
													var consequent_10 = ($$anchor) => {
														Spinner($$anchor, { class: 'mr-2 h-4 w-4' });
													};

													$.if(node_63, ($$render) => {
														if ($.get(creatingRole)) $$render(consequent_10);
													});
												}

												$.next();
												$.append($$anchor, fragment_35);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_34);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_32);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_31);
			},
			$$slots: { default: true }
		});
	});

	var node_64 = $.sibling(node_44, 2);

	$.component(node_64, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			get open() {
				return $.get(showDeleteDialog);
			},

			set open($$value) {
				$.set(showDeleteDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_37 = $.comment();
				var node_65 = $.first_child(fragment_37);

				$.component(node_65, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_38 = root_21();
							var node_66 = $.first_child(fragment_38);

							$.component(node_66, () => Dialog.Header, ($$anchor, Dialog_Header_2) => {
								Dialog_Header_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_39 = root_7();
										var node_67 = $.first_child(fragment_39);

										$.component(node_67, () => Dialog.Title, ($$anchor, Dialog_Title_2) => {
											Dialog_Title_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Delete Role');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										var node_68 = $.sibling(node_67, 2);

										$.component(node_68, () => Dialog.Description, ($$anchor, Dialog_Description_2) => {
											Dialog_Description_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_40 = root_18();
													var span_1 = $.sibling($.first_child(fragment_40));
													var text_26 = $.only_child(span_1, true);

													$.next();
													$.template_effect(() => $.set_text(text_26, $.get(roleToDelete)?.role_name));
													$.append($$anchor, fragment_40);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_39);
									},
									$$slots: { default: true }
								});
							});

							var div_17 = $.sibling(node_66, 2);
							var div_18 = $.child(div_17);
							var node_69 = $.child(div_18);

							Label(node_69, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('What should happen to users in this role?');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});

							var div_19 = $.sibling(node_69, 2);
							var node_70 = $.child(div_19);

							{
								let $0 = $.derived(() => $.get(deleteAction) === "remove" ? "default" : "outline");

								Button(node_70, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => $.set(deleteAction, "remove"),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_28 = $.text('Remove assignments');

										$.append($$anchor, text_28);
									},
									$$slots: { default: true }
								});
							}

							var node_71 = $.sibling(node_70, 2);

							{
								let $0 = $.derived(() => $.get(deleteAction) === "migrate" ? "default" : "outline");

								Button(node_71, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => $.set(deleteAction, "migrate"),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_29 = $.text('Migrate to another role');

										$.append($$anchor, text_29);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_19);
							$.reset(div_18);

							var node_72 = $.sibling(div_18, 2);

							{
								var consequent_11 = ($$anchor) => {
									var div_20 = root_19();
									var node_73 = $.child(div_20);

									Label(node_73, {
										for: 'target-role',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Target Role');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									var select_2 = $.sibling(node_73, 2);
									var option_4 = $.child(select_2);

									option_4.value = option_4.__value = '';

									var node_74 = $.sibling(option_4);

									$.each(node_74, 17, () => $.get(roles).filter((r) => r.id !== $.get(roleToDelete)?.id && r.status === "ACTIVE"), (r) => r.id, ($$anchor, r) => {
										var option_5 = root_14();
										var text_31 = $.only_child(option_5, true);
										var option_5_value = {};

										$.template_effect(() => {
											$.set_text(text_31, $.get(r).role_name);

											if (option_5_value !== (option_5_value = $.get(r).id)) {
												option_5.value = (option_5.__value = option_5_value) ?? '';
											}
										});

										$.append($$anchor, option_5);
									});

									$.reset(select_2);
									$.init_select(select_2);
									$.reset(div_20);
									$.bind_select_value(select_2, () => $.get(deleteTargetRoleId), ($$value) => $.set(deleteTargetRoleId, $$value));
									$.append($$anchor, div_20);
								};

								$.if(node_72, ($$render) => {
									if ($.get(deleteAction) === "migrate") $$render(consequent_11);
								});
							}

							$.reset(div_17);

							var node_75 = $.sibling(div_17, 2);

							$.component(node_75, () => Dialog.Footer, ($$anchor, Dialog_Footer_2) => {
								Dialog_Footer_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_41 = root_7();
										var node_76 = $.first_child(fragment_41);

										Button(node_76, {
											variant: 'outline',
											onclick: () => $.set(showDeleteDialog, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Cancel');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});

										var node_77 = $.sibling(node_76, 2);

										{
											let $0 = $.derived(() => $.get(deletingRole) || $.get(deleteAction) === "migrate" && !$.get(deleteTargetRoleId));

											Button(node_77, {
												variant: 'destructive',
												onclick: handleDeleteRole,
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_42 = root_20();
													var node_78 = $.first_child(fragment_42);

													{
														var consequent_12 = ($$anchor) => {
															Spinner($$anchor, { class: 'mr-2 h-4 w-4' });
														};

														$.if(node_78, ($$render) => {
															if ($.get(deletingRole)) $$render(consequent_12);
														});
													}

													$.next();
													$.append($$anchor, fragment_42);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_41);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_38);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_37);
			},
			$$slots: { default: true }
		});
	});

	var node_79 = $.sibling(node_64, 2);

	$.component(node_79, () => Sheet.Root, ($$anchor, Sheet_Root) => {
		Sheet_Root($$anchor, {
			get open() {
				return $.get(showPermissionsSheet);
			},

			set open($$value) {
				$.set(showPermissionsSheet, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_44 = $.comment();
				var node_80 = $.first_child(fragment_44);

				$.component(node_80, () => Sheet.Content, ($$anchor, Sheet_Content) => {
					Sheet_Content($$anchor, {
						side: 'right',
						class: 'w-full overflow-y-auto sm:max-w-lg',
						children: ($$anchor, $$slotProps) => {
							var fragment_45 = root_28();
							var node_81 = $.first_child(fragment_45);

							$.component(node_81, () => Sheet.Header, ($$anchor, Sheet_Header) => {
								Sheet_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_46 = root_7();
										var node_82 = $.first_child(fragment_46);

										$.component(node_82, () => Sheet.Title, ($$anchor, Sheet_Title) => {
											Sheet_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_33 = $.text();

													$.template_effect(() => $.set_text(text_33, `Permissions — ${$.get(permissionsRole)?.role_name ?? ''}`));
													$.append($$anchor, text_33);
												},
												$$slots: { default: true }
											});
										});

										var node_83 = $.sibling(node_82, 2);

										$.component(node_83, () => Sheet.Description, ($$anchor, Sheet_Description) => {
											Sheet_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_48 = $.comment();
													var node_84 = $.first_child(fragment_48);

													{
														var consequent_13 = ($$anchor) => {
															var text_34 = $.text('This is a readonly role. Permissions cannot be modified.');

															$.append($$anchor, text_34);
														};

														var alternate_2 = ($$anchor) => {
															var text_35 = $.text('Toggle permissions for this role.');

															$.append($$anchor, text_35);
														};

														$.if(node_84, ($$render) => {
															if ($.get(permissionsRole)?.readonly === 1) $$render(consequent_13); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_48);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_46);
									},
									$$slots: { default: true }
								});
							});

							var div_21 = $.sibling(node_81, 2);
							var node_85 = $.child(div_21);

							{
								var consequent_14 = ($$anchor) => {
									var div_22 = root_1();
									var node_86 = $.child(div_22);

									Spinner(node_86, { class: 'h-6 w-6' });
									$.reset(div_22);
									$.append($$anchor, div_22);
								};

								var alternate_3 = ($$anchor) => {
									var fragment_49 = root_27();
									var div_23 = $.first_child(fragment_49);
									var node_87 = $.child(div_23);

									$.component(node_87, () => Accordion.Root, ($$anchor, Accordion_Root) => {
										Accordion_Root($$anchor, {
											type: 'multiple',
											children: ($$anchor, $$slotProps) => {
												var fragment_50 = $.comment();
												var node_88 = $.first_child(fragment_50);

												$.each(node_88, 17, () => $.get(groupedPermissions), (group) => group.group, ($$anchor, group) => {
													const granted = $.derived(() => groupGrantedCount($.get(group).permissions));
													var fragment_51 = $.comment();
													var node_89 = $.first_child(fragment_51);

													$.component(node_89, () => Accordion.Item, ($$anchor, Accordion_Item) => {
														Accordion_Item($$anchor, {
															get value() {
																return $.get(group).group;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_52 = root_7();
																var node_90 = $.first_child(fragment_52);

																$.component(node_90, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
																	Accordion_Trigger($$anchor, {
																		class: 'px-4',
																		children: ($$anchor, $$slotProps) => {
																			var div_24 = root_22();
																			var span_2 = $.child(div_24);
																			var text_36 = $.only_child(span_2, true);
																			var node_91 = $.sibling(span_2, 2);

																			{
																				let $0 = $.derived(() => $.get(granted) === $.get(group).permissions.length
																					? "default"
																					: $.get(granted) > 0 ? "secondary" : "outline");

																				Badge(node_91, {
																					get variant() {
																						return $.get($0);
																					},
																					class: 'ml-2',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_37 = $.text();

																						$.template_effect(() => $.set_text(text_37, `${$.get(granted) ?? ''}/${$.get(group).permissions.length ?? ''}`));
																						$.append($$anchor, text_37);
																					},
																					$$slots: { default: true }
																				});
																			}

																			$.reset(div_24);
																			$.template_effect(() => $.set_text(text_36, $.get(group).label));
																			$.append($$anchor, div_24);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_92 = $.sibling(node_90, 2);

																$.component(node_92, () => Accordion.Content, ($$anchor, Accordion_Content) => {
																	Accordion_Content($$anchor, {
																		class: 'px-4',
																		children: ($$anchor, $$slotProps) => {
																			var div_25 = root_24();

																			$.each(div_25, 21, () => $.get(group).permissions, (perm) => perm.id, ($$anchor, perm) => {
																				{
																					let $0 = $.derived(() => $.get(rolePermissionIds).has($.get(perm).id) ? "outline" : "ghost");
																					let $1 = $.derived(() => $.get(rolePermissionIds).has($.get(perm).id) ? 'border-primary bg-primary/5' : '');
																					let $2 = $.derived(() => $.get(permissionsRole)?.readonly === 1 || !hasPermission("roles.assign_permissions"));

																					Button($$anchor, {
																						get variant() {
																							return $.get($0);
																						},

																						get class() {
																							return `h-auto justify-start gap-3 p-3 text-left ${$.get($1) ?? ''}`;
																						},

																						get disabled() {
																							return $.get($2);
																						},
																						onclick: () => togglePermission($.get(perm).id),
																						children: ($$anchor, $$slotProps) => {
																							var fragment_55 = root_23();
																							var node_93 = $.first_child(fragment_55);

																							{
																								let $0 = $.derived(() => $.get(rolePermissionIds).has($.get(perm).id));
																								let $1 = $.derived(() => $.get(permissionsRole)?.readonly === 1 || !hasPermission("roles.assign_permissions"));

																								$.component(node_93, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
																									Checkbox_Root($$anchor, {
																										get checked() {
																											return $.get($0);
																										},

																										get disabled() {
																											return $.get($1);
																										}
																									});
																								});
																							}

																							var div_26 = $.sibling(node_93, 2);
																							var span_3 = $.child(div_26);
																							var text_38 = $.only_child(span_3, true);

																							$.reset(div_26);
																							$.template_effect(() => $.set_text(text_38, $.get(perm).permission_name));
																							$.append($$anchor, fragment_55);
																						},
																						$$slots: { default: true }
																					});
																				}
																			});

																			$.reset(div_25);
																			$.append($$anchor, div_25);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_52);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_51);
												});

												$.append($$anchor, fragment_50);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_23);

									var node_94 = $.sibling(div_23, 2);

									{
										var consequent_16 = ($$anchor) => {
											var div_27 = root_26();
											var node_95 = $.child(div_27);

											Button(node_95, {
												variant: 'outline',
												onclick: () => $.set(showPermissionsSheet, false),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_39 = $.text('Cancel');

													$.append($$anchor, text_39);
												},
												$$slots: { default: true }
											});

											var node_96 = $.sibling(node_95, 2);

											Button(node_96, {
												onclick: savePermissions,
												get disabled() {
													return $.get(savingPermissions);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_56 = root_25();
													var node_97 = $.first_child(fragment_56);

													{
														var consequent_15 = ($$anchor) => {
															Spinner($$anchor, { class: 'mr-2 h-4 w-4' });
														};

														$.if(node_97, ($$render) => {
															if ($.get(savingPermissions)) $$render(consequent_15);
														});
													}

													$.next();
													$.append($$anchor, fragment_56);
												},
												$$slots: { default: true }
											});

											$.reset(div_27);
											$.append($$anchor, div_27);
										};

										var d_3 = $.derived(() => $.get(permissionsRole)?.readonly !== 1 && hasPermission("roles.assign_permissions"));

										$.if(node_94, ($$render) => {
											if ($.get(d_3)) $$render(consequent_16);
										});
									}

									$.append($$anchor, fragment_49);
								};

								$.if(node_85, ($$render) => {
									if ($.get(loadingPermissions)) $$render(consequent_14); else $$render(alternate_3, -1);
								});
							}

							$.reset(div_21);
							$.append($$anchor, fragment_45);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_44);
			},
			$$slots: { default: true }
		});
	});

	var node_98 = $.sibling(node_79, 2);

	$.component(node_98, () => Sheet.Root, ($$anchor, Sheet_Root_1) => {
		Sheet_Root_1($$anchor, {
			get open() {
				return $.get(showUsersSheet);
			},

			set open($$value) {
				$.set(showUsersSheet, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_58 = $.comment();
				var node_99 = $.first_child(fragment_58);

				$.component(node_99, () => Sheet.Content, ($$anchor, Sheet_Content_1) => {
					Sheet_Content_1($$anchor, {
						side: 'right',
						class: 'w-full overflow-y-auto sm:max-w-lg',
						children: ($$anchor, $$slotProps) => {
							var fragment_59 = root_7();
							var node_100 = $.first_child(fragment_59);

							$.component(node_100, () => Sheet.Header, ($$anchor, Sheet_Header_1) => {
								Sheet_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_60 = root_7();
										var node_101 = $.first_child(fragment_60);

										$.component(node_101, () => Sheet.Title, ($$anchor, Sheet_Title_1) => {
											Sheet_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_40 = $.text();

													$.template_effect(() => $.set_text(text_40, `Users — ${$.get(usersRole)?.role_name ?? ''}`));
													$.append($$anchor, text_40);
												},
												$$slots: { default: true }
											});
										});

										var node_102 = $.sibling(node_101, 2);

										$.component(node_102, () => Sheet.Description, ($$anchor, Sheet_Description_1) => {
											Sheet_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_41 = $.text('Manage users assigned to this role.');

													$.append($$anchor, text_41);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_60);
									},
									$$slots: { default: true }
								});
							});

							var node_103 = $.sibling(node_100, 2);

							{
								var consequent_17 = ($$anchor) => {
									var div_28 = root_1();
									var node_104 = $.child(div_28);

									Spinner(node_104, { class: 'h-6 w-6' });
									$.reset(div_28);
									$.append($$anchor, div_28);
								};

								var alternate_8 = ($$anchor) => {
									var fragment_62 = root_35();
									var div_29 = $.first_child(fragment_62);
									var h4 = $.child(div_29);
									var text_42 = $.only_child(h4);
									var node_105 = $.sibling(h4, 2);

									{
										var consequent_18 = ($$anchor) => {
											var p_3 = root_29();

											$.append($$anchor, p_3);
										};

										var alternate_5 = ($$anchor) => {
											var div_30 = root_31();

											$.each(div_30, 21, () => $.get(roleUsers), (user) => user.id, ($$anchor, user) => {
												var div_31 = root_30();
												var div_32 = $.child(div_31);
												var span_4 = $.child(div_32);
												var text_43 = $.only_child(span_4, true);
												var span_5 = $.sibling(span_4, 2);
												var text_44 = $.only_child(span_5, true);

												$.reset(div_32);

												var node_106 = $.sibling(div_32, 2);

												{
													var consequent_20 = ($$anchor) => {
														{
															let $0 = $.derived(() => $.get(removingUserId) === $.get(user).id);

															Button($$anchor, {
																variant: 'ghost',
																size: 'sm',
																get disabled() {
																	return $.get($0);
																},
																onclick: () => removeUser($.get(user).id),
																children: ($$anchor, $$slotProps) => {
																	var fragment_64 = $.comment();
																	var node_107 = $.first_child(fragment_64);

																	{
																		var consequent_19 = ($$anchor) => {
																			Spinner($$anchor, { class: 'h-4 w-4' });
																		};

																		var alternate_4 = ($$anchor) => {
																			UserMinusIcon($$anchor, { class: 'text-destructive h-4 w-4' });
																		};

																		$.if(node_107, ($$render) => {
																			if ($.get(removingUserId) === $.get(user).id) $$render(consequent_19); else $$render(alternate_4, -1);
																		});
																	}

																	$.append($$anchor, fragment_64);
																},
																$$slots: { default: true }
															});
														}
													};

													var d_4 = $.derived(() => hasPermission("roles.assign_users"));

													$.if(node_106, ($$render) => {
														if ($.get(d_4)) $$render(consequent_20);
													});
												}

												$.reset(div_31);

												$.template_effect(() => {
													$.set_text(text_43, $.get(user).name);
													$.set_text(text_44, $.get(user).email);
												});

												$.append($$anchor, div_31);
											});

											$.reset(div_30);
											$.append($$anchor, div_30);
										};

										$.if(node_105, ($$render) => {
											if ($.get(roleUsers).length === 0) $$render(consequent_18); else $$render(alternate_5, -1);
										});
									}

									$.reset(div_29);

									var node_108 = $.sibling(div_29, 2);

									{
										var consequent_23 = ($$anchor) => {
											var fragment_67 = root_34();
											var node_109 = $.first_child(fragment_67);

											Separator(node_109, {});

											var div_33 = $.sibling(node_109, 2);
											var node_110 = $.sibling($.child(div_33), 2);

											{
												var consequent_21 = ($$anchor) => {
													var p_4 = root_32();

													$.append($$anchor, p_4);
												};

												var alternate_7 = ($$anchor) => {
													var div_34 = root_33();

													$.each(div_34, 21, () => $.get(availableUsersToAdd), (user) => user.id, ($$anchor, user) => {
														var div_35 = root_30();
														var div_36 = $.child(div_35);
														var span_6 = $.child(div_36);
														var text_45 = $.only_child(span_6, true);
														var span_7 = $.sibling(span_6, 2);
														var text_46 = $.only_child(span_7, true);

														$.reset(div_36);

														var node_111 = $.sibling(div_36, 2);

														{
															let $0 = $.derived(() => $.get(addingUserId) === $.get(user).id);

															Button(node_111, {
																variant: 'ghost',
																size: 'sm',
																get disabled() {
																	return $.get($0);
																},
																onclick: () => addUser($.get(user).id),
																children: ($$anchor, $$slotProps) => {
																	var fragment_68 = $.comment();
																	var node_112 = $.first_child(fragment_68);

																	{
																		var consequent_22 = ($$anchor) => {
																			Spinner($$anchor, { class: 'h-4 w-4' });
																		};

																		var alternate_6 = ($$anchor) => {
																			UserPlusIcon($$anchor, { class: 'h-4 w-4' });
																		};

																		$.if(node_112, ($$render) => {
																			if ($.get(addingUserId) === $.get(user).id) $$render(consequent_22); else $$render(alternate_6, -1);
																		});
																	}

																	$.append($$anchor, fragment_68);
																},
																$$slots: { default: true }
															});
														}

														$.reset(div_35);

														$.template_effect(() => {
															$.set_text(text_45, $.get(user).name);
															$.set_text(text_46, $.get(user).email);
														});

														$.append($$anchor, div_35);
													});

													$.reset(div_34);
													$.append($$anchor, div_34);
												};

												$.if(node_110, ($$render) => {
													if ($.get(availableUsersToAdd).length === 0) $$render(consequent_21); else $$render(alternate_7, -1);
												});
											}

											$.reset(div_33);
											$.append($$anchor, fragment_67);
										};

										var d_5 = $.derived(() => hasPermission("roles.assign_users"));

										$.if(node_108, ($$render) => {
											if ($.get(d_5)) $$render(consequent_23);
										});
									}

									$.template_effect(() => $.set_text(text_42, `Current Users (${$.get(roleUsers).length ?? ''})`));
									$.append($$anchor, fragment_62);
								};

								$.if(node_103, ($$render) => {
									if ($.get(loadingUsers)) $$render(consequent_17); else $$render(alternate_8, -1);
								});
							}

							$.append($$anchor, fragment_59);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_58);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}