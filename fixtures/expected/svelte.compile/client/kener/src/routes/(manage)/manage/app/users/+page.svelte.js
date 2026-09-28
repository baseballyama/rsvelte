import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Sheet from "$lib/components/ui/sheet/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import GC from "$lib/global-constants";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import UsersIcon from "@lucide/svelte/icons/users";
import PlusIcon from "@lucide/svelte/icons/plus";
import SettingsIcon from "@lucide/svelte/icons/settings";
import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
import CheckCheckIcon from "@lucide/svelte/icons/check-check";
import MailWarningIcon from "@lucide/svelte/icons/mail-warning";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import EyeClosedIcon from "@lucide/svelte/icons/eye-closed";
import EyeOpenIcon from "@lucide/svelte/icons/eye";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { toast } from "svelte-sonner";
import { format } from "date-fns";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<p class="text-muted-foreground max-w-xs text-xs">Email service not configured. Cannot invite new users. Please go to <a target="_blank" class="text-blue-500 underline">setup email</a> for more info.</p>`);
var root_1 = $.from_html(`<!> Add User`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex items-center justify-center gap-2"><!> <span class="text-muted-foreground text-sm">Loading users...</span></div>`);
var root_5 = $.from_html(` <!>`, 1);
var root_6 = $.from_html(`<span class="text-sm font-semibold text-green-500">ACTIVE</span>`);
var root_7 = $.from_html(`<span class="text-sm font-semibold text-pink-500">INACTIVE</span>`);
var root_8 = $.from_html(`<!> Verify Email`, 1);
var root_9 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_10 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_11 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_12 = $.from_html(`<label class="flex items-center gap-2"><!> <span class="text-sm uppercase"> </span></label>`);
var root_13 = $.from_html(`<p class="text-muted-foreground text-sm">No roles available</p>`);
var root_14 = $.from_html(`<p class="text-destructive text-sm font-medium"> </p>`);
var root_15 = $.from_html(`<!> <form><div class="space-y-4 py-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <div class="space-y-2"><!> <!></div></div> <!></div> <!></form>`, 1);
var root_16 = $.from_html(`<!> Resend Invitation`, 1);
var root_17 = $.from_html(`<p class="mb-3 text-sm"> </p> <!> <!>`, 1);
var root_18 = $.from_html(`<!> Update Roles`, 1);
var root_19 = $.from_html(`<p class="mb-3 text-sm">Change the roles of the user. The user will have different permissions based on assigned roles.</p> <div class="space-y-2"><!> <!></div> <!>`, 1);
var root_20 = $.from_html(`<!> Deactivate User`, 1);
var root_21 = $.from_html(`<p class="mb-3 text-sm">Deactivate User. The user will not be able to login. Existing session will get invalidated.</p> <!>`, 1);
var root_22 = $.from_html(`<!> Activate User`, 1);
var root_23 = $.from_html(`<p class="mb-3 text-sm">Activate User. The user will be able to login.</p> <!>`, 1);
var root_24 = $.from_html(`<div class="space-y-6 py-6"><div class="space-y-2 text-sm"><p><strong>Created At:</strong> </p> <p><strong>Updated At:</strong> </p> <p><strong>Name:</strong> </p></div> <!> <!> <!> <!> <!></div>`);
var root_25 = $.from_html(`<!> <div class="px-4"><!></div>`, 1);
var root_26 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-1"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div> <div class="ktable rounded-xl border"><!></div> <!></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Types
	// Derived from data
	let currentUser = $.derived(() => $$props.data.userDb);

	let userPermissions = $.derived(() => $$props.data.userPermissions);
	let canSendEmail = $.derived(() => $$props.data.canSendEmail);

	function hasPermission(perm) {
		return $.get(userPermissions).includes(perm);
	}

	// State
	let loading = $.state(true);

	let users = $.state($.proxy([]));
	let roles = $.state($.proxy([]));
	let page = $.state(1);
	let limit = 10;
	let total = $.state(0);
	let totalPages = $.state(0);
	let statusFilter = $.state("ACTIVE");

	// Add user modal state
	let showAddUserDialog = $.state(false);

	let creatingUser = $.state(false);
	let creatingUserError = $.state("");
	let newUser = $.state($.proxy({ name: "", email: "", role_ids: [] }));

	// Edit user sheet state
	let showSettingsSheet = $.state(false);

	let toEditUser = $.state(null);
	let manualUpdateError = $.state("");
	let manualSuccess = $.state("");
	let sendingSelfVerification = $.state(false);
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function normalizeEmail(email) {
		return email.trim().toLowerCase();
	}

	function normalizeName(name) {
		return name.trim().replace(/\s+/g, " ");
	}

	// Fetch users
	async function fetchUsers() {
		$.set(loading, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getUsers",
					data: {
						page: $.get(page),
						limit,
						is_active: $.get(statusFilter) === "ACTIVE" ? 1 : 0
					}
				})
			});

			const result = await res.json();

			if (!result.error) {
				$.set(users, result.users || [], true);
				$.set(total, result.total || 0, true);
				$.set(totalPages, Math.ceil($.get(total) / limit), true);
			}
		} catch(error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
		} finally {
			$.set(loading, false);
		}
	}

	// Create new user
	async function createNewUser() {
		$.set(creatingUserError, "");

		const normalizedName = normalizeName($.get(newUser).name);
		const normalizedEmail = normalizeEmail($.get(newUser).email);

		if (!normalizedName) {
			$.set(creatingUserError, "Name cannot be empty");

			return;
		}

		if (normalizedName.length < 2) {
			$.set(creatingUserError, "Name must be at least 2 characters");

			return;
		}

		if (normalizedName.length > 100) {
			$.set(creatingUserError, "Name must be less than 100 characters");

			return;
		}

		if (!normalizedEmail) {
			$.set(creatingUserError, "Email cannot be empty");

			return;
		}

		if (!EMAIL_REGEX.test(normalizedEmail)) {
			$.set(creatingUserError, "Please enter a valid email address");

			return;
		}

		if ($.get(newUser).role_ids.length === 0) {
			$.set(creatingUserError, "At least one role must be selected");

			return;
		}

		$.set(creatingUser, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "createNewUser",
					data: {
						...$.get(newUser),
						name: normalizedName,
						email: normalizedEmail
					}
				})
			});

			const result = await res.json();

			if (result.error) {
				$.set(creatingUserError, result.error, true);
			} else {
				$.set(users, [...$.get(users), result], true);
				$.set(showAddUserDialog, false);
				resetNewUser();
				toast.success("User invited successfully");
			}
		} catch(error) {
			$.set(creatingUserError, "Error while creating user");
		} finally {
			$.set(creatingUser, false);
		}
	}

	function resetNewUser() {
		$.set(newUser, { name: "", email: "", role_ids: [] }, true);
	}

	// Open settings for a user
	function openSettingsSheet(user) {
		$.set(
			toEditUser,
			{
				...JSON.parse(JSON.stringify(user)),
				actions: {
					sendingVerificationEmail: false,
					resendingInvitation: false,
					updatingRole: false,
					deactivatingUser: false,
					activatingUser: false
				}
			},
			true
		);

		$.set(manualUpdateError, "");
		$.set(manualSuccess, "");
		$.set(showSettingsSheet, true);
	}

	// Resend invitation email
	async function resendInvitationEmail(email) {
		try {
			await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "resendInvitation", data: { email } })
			});

			toast.success("Invitation email resent");
		} catch(error) {
			toast.error("Failed to resend invitation email");
		}
	}

	// Send verification email
	async function sendVerificationEmail(id) {
		$.set(sendingSelfVerification, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "sendVerificationEmail", data: { toId: id } })
			});

			const result = await res.json();

			if (!res.ok || result.error) {
				throw new Error(result.error || "Failed to send verification email");
			}

			toast.success("Verification email sent");
		} catch(error) {
			const message = error instanceof Error ? error.message : "Failed to send verification email";

			toast.error(message);
		} finally {
			$.set(sendingSelfVerification, false);
		}
	}

	// Manual update user data
	async function manualUpdateData(updateType) {
		if (!$.get(toEditUser)) return;

		$.set(manualUpdateError, "");
		$.set(manualSuccess, "");

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "manualUpdate",
					data: { ...$.get(toEditUser), updateType }
				})
			});

			const result = await res.json();

			if (result.error) {
				$.set(manualUpdateError, result.error, true);
			} else {
				$.set(users, $.get(users).map((user) => user.id === $.get(toEditUser).id ? result : user), true);
				$.set(manualSuccess, `User ${updateType} updated successfully`);

				// Update toEditUser with the result
				$.set(toEditUser, { ...result, actions: $.get(toEditUser).actions }, true);
			}
		} catch(error) {
			$.set(manualUpdateError, "Error while updating user");
		}
	}

	// Pagination
	function goToPage(newPage) {
		$.set(page, newPage, true);
		fetchUsers();
	}

	// Format date
	function formatDate(dateStr) {
		if (dateStr instanceof Date) {
			return format(dateStr, "MMM dd, yyyy HH:mm");
		}

		try {
			return format(new Date(dateStr), "MMM dd, yyyy HH:mm");
		} catch {
			return dateStr;
		}
	}

	// Role badge variant by precedence: admin > editor > others
	function getRoleBadgeVariant(roleIds) {
		if (roleIds.includes("admin")) return "default";
		if (roleIds.includes("editor")) return "secondary";

		return "outline";
	}

	let activeRoles = $.derived(() => $.get(roles).filter((r) => r.status === "ACTIVE"));

	// Fetch roles
	async function fetchRoles() {
		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getRoles", data: {} })
			});

			const result = await res.json();

			if (!result.error) {
				$.set(roles, result, true);
			}
		} catch {
			toast.error("Failed to load roles");
		}
	}

	function toggleRole(roleId, currentList) {
		if (currentList.includes(roleId)) {
			return currentList.filter((r) => r !== roleId);
		} else {
			return [...currentList, roleId];
		}
	}

	// Initial load
	onMount(() => {
		fetchUsers();
		fetchRoles();
	});

	var fragment = root_26();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(statusFilter) === "ACTIVE" ? "default" : "outline");

		Button(node, {
			get variant() {
				return $.get($0);
			},
			size: 'sm',
			onclick: () => {
				$.set(statusFilter, "ACTIVE");
				$.set(page, 1);
				fetchUsers();
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Active');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(statusFilter) === "INACTIVE" ? "default" : "outline");

		Button(node_1, {
			get variant() {
				return $.get($0);
			},
			size: 'sm',
			onclick: () => {
				$.set(statusFilter, "INACTIVE");
				$.set(page, 1);
				fetchUsers();
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Inactive');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_2, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = root_2();
			var node_4 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root();
					var a = $.sibling($.child(p));

					$.next();
					$.reset(p);
					$.template_effect(() => $.set_attribute(a, 'href', `${GC.DOCS_URL}/setup/email-setup`));
					$.append($$anchor, p);
				};

				$.if(node_4, ($$render) => {
					if (!$.get(canSendEmail)) $$render(consequent_1);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => !$.get(canSendEmail));

				Button(node_5, {
					onclick: () => $.set(showAddUserDialog, true),
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_6 = $.first_child(fragment_3);

						PlusIcon(node_6, { class: 'h-4 w-4' });
						$.next();
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_2);
		};

		var d = $.derived(() => hasPermission("users.write"));

		$.if(node_3, ($$render) => {
			if ($.get(d)) $$render(consequent_2);
		});
	}

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_7 = $.child(div_4);

	$.component(node_7, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_2();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_3();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Name');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Email');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												class: 'text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Verified');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Role');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Table.Head, ($$anchor, Table_Head_4) => {
											Table_Head_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Status');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Table.Head, ($$anchor, Table_Head_5) => {
											Table_Head_5($$anchor, {
												class: 'w-20 text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Actions');

													$.append($$anchor, text_7);
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
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_8, 2);

				$.component(node_16, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_17 = $.first_child(fragment_7);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_8 = $.comment();
									var node_18 = $.first_child(fragment_8);

									$.component(node_18, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_19 = $.first_child(fragment_9);

												$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														colspan: 6,
														class: 'py-8 text-center',
														children: ($$anchor, $$slotProps) => {
															var div_5 = root_4();
															var node_20 = $.child(div_5);

															Spinner(node_20, { class: 'size-4' });
															$.next(2);
															$.reset(div_5);
															$.append($$anchor, div_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								};

								var consequent_4 = ($$anchor) => {
									var fragment_10 = $.comment();
									var node_21 = $.first_child(fragment_10);

									$.component(node_21, () => Table.Row, ($$anchor, Table_Row_2) => {
										Table_Row_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_22 = $.first_child(fragment_11);

												$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														colspan: 6,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('No users found.');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								};

								var alternate_2 = ($$anchor) => {
									var fragment_12 = $.comment();
									var node_23 = $.first_child(fragment_12);

									$.each(node_23, 17, () => $.get(users), (user) => user.id, ($$anchor, user) => {
										var fragment_13 = $.comment();
										var node_24 = $.first_child(fragment_13);

										{
											let $0 = $.derived(() => $.get(currentUser).id === $.get(user).id ? "bg-muted/50" : "");

											$.component(node_24, () => Table.Row, ($$anchor, Table_Row_3) => {
												Table_Row_3($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_14 = root_3();
														var node_25 = $.first_child(fragment_14);

														$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_2) => {
															Table_Cell_2($$anchor, {
																class: 'font-medium',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_15 = root_5();
																	var text_9 = $.first_child(fragment_15, true);
																	var node_26 = $.sibling(text_9);

																	{
																		var consequent_5 = ($$anchor) => {
																			Badge($$anchor, {
																				variant: 'outline',
																				class: 'ml-1 text-[10px]',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text('You');

																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		};

																		$.if(node_26, ($$render) => {
																			if ($.get(currentUser).id === $.get(user).id) $$render(consequent_5);
																		});
																	}

																	$.template_effect(() => $.set_text(text_9, $.get(user).name));
																	$.append($$anchor, fragment_15);
																},
																$$slots: { default: true }
															});
														});

														var node_27 = $.sibling(node_25, 2);

														$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_3) => {
															Table_Cell_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text();

																	$.template_effect(() => $.set_text(text_11, $.get(user).email));
																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});
														});

														var node_28 = $.sibling(node_27, 2);

														$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_4) => {
															Table_Cell_4($$anchor, {
																class: 'text-center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_18 = $.comment();
																	var node_29 = $.first_child(fragment_18);

																	{
																		var consequent_6 = ($$anchor) => {
																			CheckCheckIcon($$anchor, { class: 'mx-auto h-4 w-4 text-blue-500' });
																		};

																		var alternate = ($$anchor) => {
																			MailWarningIcon($$anchor, { class: 'mx-auto h-4 w-4 text-yellow-500' });
																		};

																		$.if(node_29, ($$render) => {
																			if ($.get(user).is_verified) $$render(consequent_6); else $$render(alternate, -1);
																		});
																	}

																	$.append($$anchor, fragment_18);
																},
																$$slots: { default: true }
															});
														});

														var node_30 = $.sibling(node_28, 2);

														$.component(node_30, () => Table.Cell, ($$anchor, Table_Cell_5) => {
															Table_Cell_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	{
																		let $0 = $.derived(() => getRoleBadgeVariant($.get(user).role_ids));

																		Badge($$anchor, {
																			get variant() {
																				return $.get($0);
																			},
																			class: 'uppercase',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_12 = $.text();

																				$.template_effect(($0) => $.set_text(text_12, $0), [() => $.get(user).role_ids.join(", ")]);
																				$.append($$anchor, text_12);
																			},
																			$$slots: { default: true }
																		});
																	}
																},
																$$slots: { default: true }
															});
														});

														var node_31 = $.sibling(node_30, 2);

														$.component(node_31, () => Table.Cell, ($$anchor, Table_Cell_6) => {
															Table_Cell_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = $.comment();
																	var node_32 = $.first_child(fragment_23);

																	{
																		var consequent_7 = ($$anchor) => {
																			var span = root_6();

																			$.append($$anchor, span);
																		};

																		var alternate_1 = ($$anchor) => {
																			var span_1 = root_7();

																			$.append($$anchor, span_1);
																		};

																		$.if(node_32, ($$render) => {
																			if ($.get(user).is_active) $$render(consequent_7); else $$render(alternate_1, -1);
																		});
																	}

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														var node_33 = $.sibling(node_31, 2);

														$.component(node_33, () => Table.Cell, ($$anchor, Table_Cell_7) => {
															Table_Cell_7($$anchor, {
																class: 'text-center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_24 = $.comment();
																	var node_34 = $.first_child(fragment_24);

																	{
																		var consequent_8 = ($$anchor) => {
																			Button($$anchor, {
																				variant: 'ghost',
																				size: 'icon',
																				class: 'h-8 w-8',
																				onclick: () => openSettingsSheet($.get(user)),
																				children: ($$anchor, $$slotProps) => {
																					SettingsIcon($$anchor, { class: 'h-4 w-4' });
																				},
																				$$slots: { default: true }
																			});
																		};

																		var d_1 = $.derived(() => hasPermission("users.write") && $.get(currentUser).id !== $.get(user).id);

																		var consequent_10 = ($$anchor) => {
																			Button($$anchor, {
																				variant: 'outline',
																				size: 'sm',
																				get disabled() {
																					return $.get(sendingSelfVerification);
																				},
																				onclick: () => sendVerificationEmail($.get(user).id),
																				children: ($$anchor, $$slotProps) => {
																					var fragment_28 = root_8();
																					var node_35 = $.first_child(fragment_28);

																					{
																						var consequent_9 = ($$anchor) => {
																							Spinner($$anchor, { class: 'size-4' });
																						};

																						$.if(node_35, ($$render) => {
																							if ($.get(sendingSelfVerification)) $$render(consequent_9);
																						});
																					}

																					$.next();
																					$.append($$anchor, fragment_28);
																				},
																				$$slots: { default: true }
																			});
																		};

																		$.if(node_34, ($$render) => {
																			if ($.get(d_1)) $$render(consequent_8); else if ($.get(currentUser).id === $.get(user).id && !!!$.get(currentUser).is_verified) $$render(consequent_10, 1);
																		});
																	}

																	$.append($$anchor, fragment_24);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_14);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_13);
									});

									$.append($$anchor, fragment_12);
								};

								$.if(node_17, ($$render) => {
									if ($.get(loading) && $.get(users).length === 0) $$render(consequent_3); else if ($.get(users).length === 0) $$render(consequent_4, 1); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_4);

	var node_36 = $.sibling(div_4, 2);

	{
		var consequent_14 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(page) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(page) * limit, $.get(total)));
			var div_6 = root_11();
			var span_2 = $.child(div_6);
			var text_13 = $.only_child(span_2);
			var node_37 = $.sibling(span_2, 2);

			{
				var consequent_13 = ($$anchor) => {
					var div_7 = root_10();
					var node_38 = $.child(div_7);

					{
						let $0 = $.derived(() => $.get(page) === 1);

						Button(node_38, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(page) - 1),
							children: ($$anchor, $$slotProps) => {
								ChevronLeftIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					var div_8 = $.sibling(node_38, 2);

					$.each(div_8, 20, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), (pageNum) => pageNum, ($$anchor, pageNum) => {
						var fragment_31 = $.comment();
						var node_39 = $.first_child(fragment_31);

						{
							var consequent_11 = ($$anchor) => {
								{
									let $0 = $.derived(() => pageNum === $.get(page) ? "default" : "ghost");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										size: 'sm',
										onclick: () => goToPage(pageNum),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text();

											$.template_effect(() => $.set_text(text_14, pageNum));
											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_12 = ($$anchor) => {
								var span_3 = root_9();

								$.append($$anchor, span_3);
							};

							$.if(node_39, ($$render) => {
								if (pageNum === 1 || pageNum === $.get(totalPages) || pageNum >= $.get(page) - 1 && pageNum <= $.get(page) + 1) $$render(consequent_11); else if (pageNum === $.get(page) - 2 || pageNum === $.get(page) + 2) $$render(consequent_12, 1);
							});
						}

						$.append($$anchor, fragment_31);
					});

					$.reset(div_8);

					var node_40 = $.sibling(div_8, 2);

					{
						let $0 = $.derived(() => $.get(page) === $.get(totalPages));

						Button(node_40, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(page) + 1),
							children: ($$anchor, $$slotProps) => {
								ChevronRightIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_37, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_13);
				});
			}

			$.reset(div_6);
			$.template_effect(() => $.set_text(text_13, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(total) ?? ''}`));
			$.append($$anchor, div_6);
		};

		$.if(node_36, ($$render) => {
			if ($.get(total) > 0) $$render(consequent_14);
		});
	}

	$.reset(div);

	var node_41 = $.sibling(div, 2);

	$.component(node_41, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showAddUserDialog);
			},

			set open($$value) {
				$.set(showAddUserDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_35 = $.comment();
				var node_42 = $.first_child(fragment_35);

				$.component(node_42, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_36 = root_15();
							var node_43 = $.first_child(fragment_36);

							$.component(node_43, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_37 = root_2();
										var node_44 = $.first_child(fragment_37);

										$.component(node_44, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Add New User');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										var node_45 = $.sibling(node_44, 2);

										$.component(node_45, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Add a new user to your project');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_37);
									},
									$$slots: { default: true }
								});
							});

							var form = $.sibling(node_43, 2);
							var div_9 = $.child(form);
							var div_10 = $.child(div_9);
							var node_46 = $.child(div_10);

							Label(node_46, {
								for: 'name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Name');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_47 = $.sibling(node_46, 2);

							Input(node_47, {
								id: 'name',
								type: 'text',
								placeholder: 'John Doe',
								required: true,
								get value() {
									return $.get(newUser).name;
								},

								set value($$value) {
									$.get(newUser).name = $$value;
								}
							});

							$.reset(div_10);

							var div_11 = $.sibling(div_10, 2);
							var node_48 = $.child(div_11);

							Label(node_48, {
								for: 'email',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Email');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_49 = $.sibling(node_48, 2);

							Input(node_49, {
								id: 'email',
								type: 'email',
								placeholder: 'email@example.com',
								required: true,
								get value() {
									return $.get(newUser).email;
								},

								set value($$value) {
									$.get(newUser).email = $$value;
								}
							});

							$.reset(div_11);

							var div_12 = $.sibling(div_11, 2);
							var node_50 = $.child(div_12);

							Label(node_50, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Roles');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var div_13 = $.sibling(node_50, 2);
							var node_51 = $.child(div_13);

							$.each(node_51, 17, () => $.get(activeRoles), (role) => role.id, ($$anchor, role) => {
								var label = root_12();
								var node_52 = $.child(label);

								{
									let $0 = $.derived(() => $.get(newUser).role_ids.includes($.get(role).id));

									Checkbox(node_52, {
										get checked() {
											return $.get($0);
										},

										onCheckedChange: () => {
											$.get(newUser).role_ids = toggleRole($.get(role).id, $.get(newUser).role_ids);
										}
									});
								}

								var span_4 = $.sibling(node_52, 2);
								var text_20 = $.only_child(span_4, true);

								$.reset(label);
								$.template_effect(() => $.set_text(text_20, $.get(role).role_name));
								$.append($$anchor, label);
							});

							var node_53 = $.sibling(node_51, 2);

							{
								var consequent_15 = ($$anchor) => {
									var p_1 = root_13();

									$.append($$anchor, p_1);
								};

								$.if(node_53, ($$render) => {
									if ($.get(activeRoles).length === 0) $$render(consequent_15);
								});
							}

							$.reset(div_13);
							$.reset(div_12);

							var node_54 = $.sibling(div_12, 2);

							{
								var consequent_16 = ($$anchor) => {
									var p_2 = root_14();
									var text_21 = $.only_child(p_2, true);

									$.template_effect(() => $.set_text(text_21, $.get(creatingUserError)));
									$.append($$anchor, p_2);
								};

								$.if(node_54, ($$render) => {
									if ($.get(creatingUserError)) $$render(consequent_16);
								});
							}

							$.reset(div_9);

							var node_55 = $.sibling(div_9, 2);

							$.component(node_55, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_38 = root_2();
										var node_56 = $.first_child(fragment_38);

										Button(node_56, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(showAddUserDialog, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_22 = $.text('Cancel');

												$.append($$anchor, text_22);
											},
											$$slots: { default: true }
										});

										var node_57 = $.sibling(node_56, 2);

										Button(node_57, {
											type: 'submit',
											get disabled() {
												return $.get(creatingUser);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_39 = root_1();
												var node_58 = $.first_child(fragment_39);

												{
													var consequent_17 = ($$anchor) => {
														Spinner($$anchor, { class: 'size-4' });
													};

													$.if(node_58, ($$render) => {
														if ($.get(creatingUser)) $$render(consequent_17);
													});
												}

												$.next();
												$.append($$anchor, fragment_39);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_38);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);

							$.event('submit', form, (e) => {
								e.preventDefault();
								createNewUser();
							});

							$.append($$anchor, fragment_36);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_35);
			},
			$$slots: { default: true }
		});
	});

	var node_59 = $.sibling(node_41, 2);

	$.component(node_59, () => Sheet.Root, ($$anchor, Sheet_Root) => {
		Sheet_Root($$anchor, {
			get open() {
				return $.get(showSettingsSheet);
			},

			set open($$value) {
				$.set(showSettingsSheet, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_41 = $.comment();
				var node_60 = $.first_child(fragment_41);

				$.component(node_60, () => Sheet.Content, ($$anchor, Sheet_Content) => {
					Sheet_Content($$anchor, {
						side: 'right',
						class: 'w-full overflow-y-auto sm:max-w-xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_42 = root_25();
							var node_61 = $.first_child(fragment_42);

							$.component(node_61, () => Sheet.Header, ($$anchor, Sheet_Header) => {
								Sheet_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_43 = root_2();
										var node_62 = $.first_child(fragment_43);

										$.component(node_62, () => Sheet.Title, ($$anchor, Sheet_Title) => {
											Sheet_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text();

													$.template_effect(() => $.set_text(text_23, `Settings - ${$.get(toEditUser)?.name ?? ''}`));
													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});
										});

										var node_63 = $.sibling(node_62, 2);

										$.component(node_63, () => Sheet.Description, ($$anchor, Sheet_Description) => {
											Sheet_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_24 = $.text('Manage user settings and permissions');

													$.append($$anchor, text_24);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_43);
									},
									$$slots: { default: true }
								});
							});

							var div_14 = $.sibling(node_61, 2);
							var node_64 = $.child(div_14);

							{
								var consequent_28 = ($$anchor) => {
									var div_15 = root_24();
									var div_16 = $.child(div_15);
									var p_3 = $.child(div_16);
									var text_25 = $.sibling($.child(p_3));

									$.reset(p_3);

									var p_4 = $.sibling(p_3, 2);
									var text_26 = $.sibling($.child(p_4));

									$.reset(p_4);

									var p_5 = $.sibling(p_4, 2);
									var text_27 = $.sibling($.child(p_5));

									$.reset(p_5);
									$.reset(div_16);

									var node_65 = $.sibling(div_16, 2);

									{
										var consequent_20 = ($$anchor) => {
											var fragment_45 = $.comment();
											var node_66 = $.first_child(fragment_45);

											$.component(node_66, () => Card.Root, ($$anchor, Card_Root) => {
												Card_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_46 = $.comment();
														var node_67 = $.first_child(fragment_46);

														$.component(node_67, () => Card.Content, ($$anchor, Card_Content) => {
															Card_Content($$anchor, {
																class: '',
																children: ($$anchor, $$slotProps) => {
																	var fragment_47 = root_17();
																	var p_6 = $.first_child(fragment_47);
																	var text_28 = $.only_child(p_6);
																	var node_68 = $.sibling(p_6, 2);

																	{
																		var consequent_18 = ($$anchor) => {
																			var fragment_48 = $.comment();
																			var node_69 = $.first_child(fragment_48);

																			$.component(node_69, () => Alert.Root, ($$anchor, Alert_Root) => {
																				Alert_Root($$anchor, {
																					variant: 'destructive',
																					class: 'mb-4',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_49 = $.comment();
																						var node_70 = $.first_child(fragment_49);

																						$.component(node_70, () => Alert.Description, ($$anchor, Alert_Description) => {
																							Alert_Description($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_29 = $.text('Email service not configured. Cannot resend invitation email.');

																									$.append($$anchor, text_29);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_49);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_48);
																		};

																		$.if(node_68, ($$render) => {
																			if (!$.get(canSendEmail)) $$render(consequent_18);
																		});
																	}

																	var node_71 = $.sibling(node_68, 2);

																	{
																		let $0 = $.derived(() => $.get(toEditUser).actions.resendingInvitation || !$.get(canSendEmail));

																		Button(node_71, {
																			variant: 'secondary',
																			get disabled() {
																				return $.get($0);
																			},

																			onclick: async () => {
																				$.get(toEditUser).actions.resendingInvitation = true;
																				$.set(manualSuccess, "");
																				await resendInvitationEmail($.get(toEditUser).email);
																				$.get(toEditUser).actions.resendingInvitation = false;
																				$.set(manualSuccess, "Invitation email resent successfully");
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_50 = root_16();
																				var node_72 = $.first_child(fragment_50);

																				{
																					var consequent_19 = ($$anchor) => {
																						Spinner($$anchor, { class: 'size-4' });
																					};

																					$.if(node_72, ($$render) => {
																						if ($.get(toEditUser).actions.resendingInvitation) $$render(consequent_19);
																					});
																				}

																				$.next();
																				$.append($$anchor, fragment_50);
																			},
																			$$slots: { default: true }
																		});
																	}

																	$.template_effect(() => $.set_text(text_28, `This user hasn't set their password yet. Resend the invitation email to ${$.get(toEditUser).email ?? ''}.`));
																	$.append($$anchor, fragment_47);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_46);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_45);
										};

										$.if(node_65, ($$render) => {
											if (!$.get(toEditUser).has_password) $$render(consequent_20);
										});
									}

									var node_73 = $.sibling(node_65, 2);

									$.component(node_73, () => Card.Root, ($$anchor, Card_Root_1) => {
										Card_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_52 = $.comment();
												var node_74 = $.first_child(fragment_52);

												$.component(node_74, () => Card.Content, ($$anchor, Card_Content_1) => {
													Card_Content_1($$anchor, {
														class: 'p-4',
														children: ($$anchor, $$slotProps) => {
															var fragment_53 = root_19();
															var div_17 = $.sibling($.first_child(fragment_53), 2);
															var node_75 = $.child(div_17);

															$.each(node_75, 17, () => $.get(activeRoles), (role) => role.id, ($$anchor, role) => {
																var label_1 = root_12();
																var node_76 = $.child(label_1);

																{
																	let $0 = $.derived(() => $.get(toEditUser).role_ids.includes($.get(role).id));

																	Checkbox(node_76, {
																		get checked() {
																			return $.get($0);
																		},

																		get disabled() {
																			return $.get(toEditUser).actions.updatingRole;
																		},

																		onCheckedChange: () => {
																			$.get(toEditUser).role_ids = toggleRole($.get(role).id, $.get(toEditUser).role_ids);
																		}
																	});
																}

																var span_5 = $.sibling(node_76, 2);
																var text_30 = $.only_child(span_5, true);

																$.reset(label_1);
																$.template_effect(() => $.set_text(text_30, $.get(role).role_name));
																$.append($$anchor, label_1);
															});

															var node_77 = $.sibling(node_75, 2);

															{
																var consequent_21 = ($$anchor) => {
																	var p_7 = root_13();

																	$.append($$anchor, p_7);
																};

																$.if(node_77, ($$render) => {
																	if ($.get(activeRoles).length === 0) $$render(consequent_21);
																});
															}

															$.reset(div_17);

															var node_78 = $.sibling(div_17, 2);

															{
																let $0 = $.derived(() => $.get(toEditUser).actions.updatingRole || $.get(toEditUser).role_ids.length === 0);

																Button(node_78, {
																	variant: 'secondary',
																	class: 'mt-3',
																	get disabled() {
																		return $.get($0);
																	},

																	onclick: () => {
																		$.get(toEditUser).actions.updatingRole = true;

																		manualUpdateData("role").then(() => {
																			$.get(toEditUser).actions.updatingRole = false;
																		});
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_54 = root_18();
																		var node_79 = $.first_child(fragment_54);

																		{
																			var consequent_22 = ($$anchor) => {
																				Spinner($$anchor, { class: 'size-4' });
																			};

																			$.if(node_79, ($$render) => {
																				if ($.get(toEditUser).actions.updatingRole) $$render(consequent_22);
																			});
																		}

																		$.next();
																		$.append($$anchor, fragment_54);
																	},
																	$$slots: { default: true }
																});
															}

															$.append($$anchor, fragment_53);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_52);
											},
											$$slots: { default: true }
										});
									});

									var node_80 = $.sibling(node_73, 2);

									{
										var consequent_24 = ($$anchor) => {
											var fragment_56 = $.comment();
											var node_81 = $.first_child(fragment_56);

											$.component(node_81, () => Card.Root, ($$anchor, Card_Root_2) => {
												Card_Root_2($$anchor, {
													class: 'border-destructive',
													children: ($$anchor, $$slotProps) => {
														var fragment_57 = $.comment();
														var node_82 = $.first_child(fragment_57);

														$.component(node_82, () => Card.Content, ($$anchor, Card_Content_2) => {
															Card_Content_2($$anchor, {
																class: 'p-4',
																children: ($$anchor, $$slotProps) => {
																	var fragment_58 = root_21();
																	var node_83 = $.sibling($.first_child(fragment_58), 2);

																	Button(node_83, {
																		variant: 'destructive',
																		get disabled() {
																			return $.get(toEditUser).actions.deactivatingUser;
																		},

																		onclick: () => {
																			$.get(toEditUser).actions.deactivatingUser = true;
																			$.get(toEditUser).is_active = 0;

																			manualUpdateData("is_active").then(() => {
																				$.get(toEditUser).actions.deactivatingUser = false;
																			});
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_59 = root_20();
																			var node_84 = $.first_child(fragment_59);

																			{
																				var consequent_23 = ($$anchor) => {
																					Spinner($$anchor, { class: 'size-4' });
																				};

																				$.if(node_84, ($$render) => {
																					if ($.get(toEditUser).actions.deactivatingUser) $$render(consequent_23);
																				});
																			}

																			$.next();
																			$.append($$anchor, fragment_59);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_58);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_57);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_56);
										};

										var alternate_3 = ($$anchor) => {
											var fragment_61 = $.comment();
											var node_85 = $.first_child(fragment_61);

											$.component(node_85, () => Card.Root, ($$anchor, Card_Root_3) => {
												Card_Root_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_62 = $.comment();
														var node_86 = $.first_child(fragment_62);

														$.component(node_86, () => Card.Content, ($$anchor, Card_Content_3) => {
															Card_Content_3($$anchor, {
																class: 'p-4',
																children: ($$anchor, $$slotProps) => {
																	var fragment_63 = root_23();
																	var node_87 = $.sibling($.first_child(fragment_63), 2);

																	Button(node_87, {
																		variant: 'secondary',
																		get disabled() {
																			return $.get(toEditUser).actions.activatingUser;
																		},

																		onclick: () => {
																			$.get(toEditUser).actions.activatingUser = true;
																			$.get(toEditUser).is_active = 1;

																			manualUpdateData("is_active").then(() => {
																				$.get(toEditUser).actions.activatingUser = false;
																			});
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_64 = root_22();
																			var node_88 = $.first_child(fragment_64);

																			{
																				var consequent_25 = ($$anchor) => {
																					Spinner($$anchor, { class: 'size-4' });
																				};

																				$.if(node_88, ($$render) => {
																					if ($.get(toEditUser).actions.activatingUser) $$render(consequent_25);
																				});
																			}

																			$.next();
																			$.append($$anchor, fragment_64);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_63);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_62);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_61);
										};

										$.if(node_80, ($$render) => {
											if ($.get(toEditUser).is_active) $$render(consequent_24); else $$render(alternate_3, -1);
										});
									}

									var node_89 = $.sibling(node_80, 2);

									{
										var consequent_26 = ($$anchor) => {
											var fragment_66 = $.comment();
											var node_90 = $.first_child(fragment_66);

											$.component(node_90, () => Alert.Root, ($$anchor, Alert_Root_1) => {
												Alert_Root_1($$anchor, {
													variant: 'destructive',
													children: ($$anchor, $$slotProps) => {
														var fragment_67 = $.comment();
														var node_91 = $.first_child(fragment_67);

														$.component(node_91, () => Alert.Description, ($$anchor, Alert_Description_1) => {
															Alert_Description_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_31 = $.text();

																	$.template_effect(() => $.set_text(text_31, $.get(manualUpdateError)));
																	$.append($$anchor, text_31);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_67);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_66);
										};

										$.if(node_89, ($$render) => {
											if ($.get(manualUpdateError)) $$render(consequent_26);
										});
									}

									var node_92 = $.sibling(node_89, 2);

									{
										var consequent_27 = ($$anchor) => {
											var fragment_69 = $.comment();
											var node_93 = $.first_child(fragment_69);

											$.component(node_93, () => Alert.Root, ($$anchor, Alert_Root_2) => {
												Alert_Root_2($$anchor, {
													class: 'border-green-500 text-green-500',
													children: ($$anchor, $$slotProps) => {
														var fragment_70 = $.comment();
														var node_94 = $.first_child(fragment_70);

														$.component(node_94, () => Alert.Description, ($$anchor, Alert_Description_2) => {
															Alert_Description_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_32 = $.text();

																	$.template_effect(() => $.set_text(text_32, $.get(manualSuccess)));
																	$.append($$anchor, text_32);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_70);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_69);
										};

										$.if(node_92, ($$render) => {
											if ($.get(manualSuccess)) $$render(consequent_27);
										});
									}

									$.reset(div_15);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_25, ` ${$0 ?? ''}`);
											$.set_text(text_26, ` ${$1 ?? ''}`);
											$.set_text(text_27, ` ${$.get(toEditUser).name ?? ''}`);
										},
										[
											() => formatDate($.get(toEditUser).created_at),
											() => formatDate($.get(toEditUser).updated_at)
										]
									);

									$.append($$anchor, div_15);
								};

								$.if(node_64, ($$render) => {
									if ($.get(toEditUser)) $$render(consequent_28);
								});
							}

							$.reset(div_14);
							$.append($$anchor, fragment_42);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_41);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}