import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		let { data } = $$props;

		// Derived from data
		let currentUser = $.derived(() => data.userDb);

		let userPermissions = $.derived(() => data.userPermissions);
		let canSendEmail = $.derived(() => data.canSendEmail);

		function hasPermission(perm) {
			return userPermissions().includes(perm);
		}

		// State
		let loading = true;

		let users = [];
		let roles = [];
		let page = 1;
		let limit = 10;
		let total = 0;
		let totalPages = 0;
		let statusFilter = "ACTIVE";

		// Add user modal state
		let showAddUserDialog = false;

		let creatingUser = false;
		let creatingUserError = "";
		let newUser = { name: "", email: "", role_ids: [] };

		// Edit user sheet state
		let showSettingsSheet = false;

		let toEditUser = null;
		let manualUpdateError = "";
		let manualSuccess = "";
		let sendingSelfVerification = false;
		const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		function normalizeEmail(email) {
			return email.trim().toLowerCase();
		}

		function normalizeName(name) {
			return name.trim().replace(/\s+/g, " ");
		}

		// Fetch users
		async function fetchUsers() {
			loading = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getUsers",
						data: { page, limit, is_active: statusFilter === "ACTIVE" ? 1 : 0 }
					})
				});

				const result = await res.json();

				if (!result.error) {
					users = result.users || [];
					total = result.total || 0;
					totalPages = Math.ceil(total / limit);
				}
			} catch(error) {
				console.error("Error fetching users:", error);
				toast.error("Failed to load users");
			} finally {
				loading = false;
			}
		}

		// Create new user
		async function createNewUser() {
			creatingUserError = "";

			const normalizedName = normalizeName(newUser.name);
			const normalizedEmail = normalizeEmail(newUser.email);

			if (!normalizedName) {
				creatingUserError = "Name cannot be empty";

				return;
			}

			if (normalizedName.length < 2) {
				creatingUserError = "Name must be at least 2 characters";

				return;
			}

			if (normalizedName.length > 100) {
				creatingUserError = "Name must be less than 100 characters";

				return;
			}

			if (!normalizedEmail) {
				creatingUserError = "Email cannot be empty";

				return;
			}

			if (!EMAIL_REGEX.test(normalizedEmail)) {
				creatingUserError = "Please enter a valid email address";

				return;
			}

			if (newUser.role_ids.length === 0) {
				creatingUserError = "At least one role must be selected";

				return;
			}

			creatingUser = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "createNewUser",
						data: { ...newUser, name: normalizedName, email: normalizedEmail }
					})
				});

				const result = await res.json();

				if (result.error) {
					creatingUserError = result.error;
				} else {
					users = [...users, result];
					showAddUserDialog = false;
					resetNewUser();
					toast.success("User invited successfully");
				}
			} catch(error) {
				creatingUserError = "Error while creating user";
			} finally {
				creatingUser = false;
			}
		}

		function resetNewUser() {
			newUser = { name: "", email: "", role_ids: [] };
		}

		// Open settings for a user
		function openSettingsSheet(user) {
			toEditUser = {
				...JSON.parse(JSON.stringify(user)),
				actions: {
					sendingVerificationEmail: false,
					resendingInvitation: false,
					updatingRole: false,
					deactivatingUser: false,
					activatingUser: false
				}
			};

			manualUpdateError = "";
			manualSuccess = "";
			showSettingsSheet = true;
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
			sendingSelfVerification = true;

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
				sendingSelfVerification = false;
			}
		}

		// Manual update user data
		async function manualUpdateData(updateType) {
			if (!toEditUser) return;

			manualUpdateError = "";
			manualSuccess = "";

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "manualUpdate", data: { ...toEditUser, updateType } })
				});

				const result = await res.json();

				if (result.error) {
					manualUpdateError = result.error;
				} else {
					users = users.map((user) => user.id === toEditUser.id ? result : user);
					manualSuccess = `User ${updateType} updated successfully`;

					// Update toEditUser with the result
					toEditUser = { ...result, actions: toEditUser.actions };
				}
			} catch(error) {
				manualUpdateError = "Error while updating user";
			}
		}

		// Pagination
		function goToPage(newPage) {
			page = newPage;
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

		let activeRoles = $.derived(() => roles.filter((r) => r.status === "ACTIVE"));

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
					roles = result;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-1">`);

			Button($$renderer, {
				variant: statusFilter === "ACTIVE" ? "default" : "outline",
				size: 'sm',
				onclick: () => {
					statusFilter = "ACTIVE";
					page = 1;
					fetchUsers();
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->Active`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: statusFilter === "INACTIVE" ? "default" : "outline",
				size: 'sm',
				onclick: () => {
					statusFilter = "INACTIVE";
					page = 1;
					fetchUsers();
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->Inactive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			if (loading) {
				$$renderer.push('<!--[0-->');
				Spinner($$renderer, { class: 'size-5' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (hasPermission("users.write")) {
				$$renderer.push('<!--[0-->');

				if (!canSendEmail()) {
					$$renderer.push(`<!--[0--><p class="text-muted-foreground max-w-xs text-xs">Email service not configured. Cannot invite new users. Please go to <a${$.attr('href', `${GC.DOCS_URL}/setup/email-setup`)} target="_blank" class="text-blue-500 underline">setup email</a> for more info.</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Button($$renderer, {
					onclick: () => showAddUserDialog = true,
					disabled: !canSendEmail(),
					children: ($$renderer) => {
						PlusIcon($$renderer, { class: 'h-4 w-4' });
						$$renderer.push(`<!----> Add User`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="ktable rounded-xl border">`);

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
															$$renderer.push(`<!---->Email`);
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
														class: 'text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Verified`);
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
															$$renderer.push(`<!---->Role`);
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
														class: 'w-20 text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Actions`);
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

						if (Table.Body) {
							$$renderer.push('<!--[-->');

							Table.Body($$renderer, {
								children: ($$renderer) => {
									if (loading && users.length === 0) {
										$$renderer.push('<!--[0-->');

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															colspan: 6,
															class: 'py-8 text-center',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center justify-center gap-2">`);
																Spinner($$renderer, { class: 'size-4' });
																$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">Loading users...</span></div>`);
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
									} else if (users.length === 0) {
										$$renderer.push('<!--[1-->');

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															colspan: 6,
															class: 'text-muted-foreground py-8 text-center',
															children: ($$renderer) => {
																$$renderer.push(`<!---->No users found.`);
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
									} else {
										$$renderer.push(`<!--[-1--><!--[-->`);

										const each_array = $.ensure_array_like(users);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let user = each_array[$$index];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													class: currentUser().id === user.id ? "bg-muted/50" : "",
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																class: 'font-medium',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(user.name)}`);

																	if (currentUser().id === user.id) {
																		$$renderer.push('<!--[0-->');

																		Badge($$renderer, {
																			variant: 'outline',
																			class: 'ml-1 text-[10px]',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->You`);
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
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
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(user.email)}`);
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
																class: 'text-center',
																children: ($$renderer) => {
																	if (user.is_verified) {
																		$$renderer.push('<!--[0-->');
																		CheckCheckIcon($$renderer, { class: 'mx-auto h-4 w-4 text-blue-500' });
																	} else {
																		$$renderer.push('<!--[-1-->');
																		MailWarningIcon($$renderer, { class: 'mx-auto h-4 w-4 text-yellow-500' });
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
																children: ($$renderer) => {
																	Badge($$renderer, {
																		variant: getRoleBadgeVariant(user.role_ids),
																		class: 'uppercase',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(user.role_ids.join(", "))}`);
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
																	if (user.is_active) {
																		$$renderer.push(`<!--[0--><span class="text-sm font-semibold text-green-500">ACTIVE</span>`);
																	} else {
																		$$renderer.push(`<!--[-1--><span class="text-sm font-semibold text-pink-500">INACTIVE</span>`);
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
																class: 'text-center',
																children: ($$renderer) => {
																	if (hasPermission("users.write") && currentUser().id !== user.id) {
																		$$renderer.push('<!--[0-->');

																		Button($$renderer, {
																			variant: 'ghost',
																			size: 'icon',
																			class: 'h-8 w-8',
																			onclick: () => openSettingsSheet(user),
																			children: ($$renderer) => {
																				SettingsIcon($$renderer, { class: 'h-4 w-4' });
																			},
																			$$slots: { default: true }
																		});
																	} else if (currentUser().id === user.id && !!!currentUser().is_verified) {
																		$$renderer.push('<!--[1-->');

																		Button($$renderer, {
																			variant: 'outline',
																			size: 'sm',
																			disabled: sendingSelfVerification,
																			onclick: () => sendVerificationEmail(user.id),
																			children: ($$renderer) => {
																				if (sendingSelfVerification) {
																					$$renderer.push('<!--[0-->');
																					Spinner($$renderer, { class: 'size-4' });
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--> Verify Email`);
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
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

			$$renderer.push(`</div> `);

			if (total > 0) {
				$$renderer.push('<!--[0-->');

				const startItem = (page - 1) * limit + 1;
				const endItem = Math.min(page * limit, total);

				$$renderer.push(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm">Showing ${$.escape(startItem)}-${$.escape(endItem)} of ${$.escape(total)}</span> `);

				if (totalPages > 1) {
					$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						disabled: page === 1,
						onclick: () => goToPage(page - 1),
						children: ($$renderer) => {
							ChevronLeftIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="flex items-center gap-1"><!--[-->`);

					const each_array_1 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let pageNum = each_array_1[$$index_1];

						if (pageNum === 1 || pageNum === totalPages || pageNum >= page - 1 && pageNum <= page + 1) {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								variant: pageNum === page ? "default" : "ghost",
								size: 'sm',
								onclick: () => goToPage(pageNum),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(pageNum)}`);
								},
								$$slots: { default: true }
							});
						} else if (pageNum === page - 2 || pageNum === page + 2) {
							$$renderer.push(`<!--[1--><span class="text-muted-foreground px-1">...</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></div> `);

					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						disabled: page === totalPages,
						onclick: () => goToPage(page + 1),
						children: ($$renderer) => {
							ChevronRightIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showAddUserDialog;
					},

					set open($$value) {
						showAddUserDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-md',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Add New User`);
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
															$$renderer.push(`<!---->Add a new user to your project`);
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

									$$renderer.push(` <form><div class="space-y-4 py-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'name',
										type: 'text',
										placeholder: 'John Doe',
										required: true,
										get value() {
											return newUser.name;
										},

										set value($$value) {
											newUser.name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'email',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Email`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'email',
										type: 'email',
										placeholder: 'email@example.com',
										required: true,
										get value() {
											return newUser.email;
										},

										set value($$value) {
											newUser.email = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Roles`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="space-y-2"><!--[-->`);

									const each_array_2 = $.ensure_array_like(activeRoles());

									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let role = each_array_2[$$index_2];

										$$renderer.push(`<label class="flex items-center gap-2">`);

										Checkbox($$renderer, {
											checked: newUser.role_ids.includes(role.id),
											onCheckedChange: () => {
												newUser.role_ids = toggleRole(role.id, newUser.role_ids);
											}
										});

										$$renderer.push(`<!----> <span class="text-sm uppercase">${$.escape(role.role_name)}</span></label>`);
									}

									$$renderer.push(`<!--]--> `);

									if (activeRoles().length === 0) {
										$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">No roles available</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div> `);

									if (creatingUserError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm font-medium">${$.escape(creatingUserError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => showAddUserDialog = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													disabled: creatingUser,
													children: ($$renderer) => {
														if (creatingUser) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'size-4' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Add User`);
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

									$$renderer.push(`</form>`);
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
						return showSettingsSheet;
					},

					set open($$value) {
						showSettingsSheet = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								side: 'right',
								class: 'w-full overflow-y-auto sm:max-w-xl',
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Settings - ${$.escape(toEditUser?.name)}`);
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
															$$renderer.push(`<!---->Manage user settings and permissions`);
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

									$$renderer.push(` <div class="px-4">`);

									if (toEditUser) {
										$$renderer.push(`<!--[0--><div class="space-y-6 py-6"><div class="space-y-2 text-sm"><p><strong>Created At:</strong> ${$.escape(formatDate(toEditUser.created_at))}</p> <p><strong>Updated At:</strong> ${$.escape(formatDate(toEditUser.updated_at))}</p> <p><strong>Name:</strong> ${$.escape(toEditUser.name)}</p></div> `);

										if (!toEditUser.has_password) {
											$$renderer.push('<!--[0-->');

											if (Card.Root) {
												$$renderer.push('<!--[-->');

												Card.Root($$renderer, {
													children: ($$renderer) => {
														if (Card.Content) {
															$$renderer.push('<!--[-->');

															Card.Content($$renderer, {
																class: '',
																children: ($$renderer) => {
																	$$renderer.push(`<p class="mb-3 text-sm">This user hasn't set their password yet. Resend the invitation email to ${$.escape(toEditUser.email)}.</p> `);

																	if (!canSendEmail()) {
																		$$renderer.push('<!--[0-->');

																		if (Alert.Root) {
																			$$renderer.push('<!--[-->');

																			Alert.Root($$renderer, {
																				variant: 'destructive',
																				class: 'mb-4',
																				children: ($$renderer) => {
																					if (Alert.Description) {
																						$$renderer.push('<!--[-->');

																						Alert.Description($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Email service not configured. Cannot resend invitation email.`);
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
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> `);

																	Button($$renderer, {
																		variant: 'secondary',
																		disabled: toEditUser.actions.resendingInvitation || !canSendEmail(),
																		onclick: async () => {
																			toEditUser.actions.resendingInvitation = true;
																			manualSuccess = "";
																			await resendInvitationEmail(toEditUser.email);
																			toEditUser.actions.resendingInvitation = false;
																			manualSuccess = "Invitation email resent successfully";
																		},

																		children: ($$renderer) => {
																			if (toEditUser.actions.resendingInvitation) {
																				$$renderer.push('<!--[0-->');
																				Spinner($$renderer, { class: 'size-4' });
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> Resend Invitation`);
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (Card.Root) {
											$$renderer.push('<!--[-->');

											Card.Root($$renderer, {
												children: ($$renderer) => {
													if (Card.Content) {
														$$renderer.push('<!--[-->');

														Card.Content($$renderer, {
															class: 'p-4',
															children: ($$renderer) => {
																$$renderer.push(`<p class="mb-3 text-sm">Change the roles of the user. The user will have different permissions based on assigned roles.</p> <div class="space-y-2"><!--[-->`);

																const each_array_3 = $.ensure_array_like(activeRoles());

																for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																	let role = each_array_3[$$index_3];

																	$$renderer.push(`<label class="flex items-center gap-2">`);

																	Checkbox($$renderer, {
																		checked: toEditUser.role_ids.includes(role.id),
																		disabled: toEditUser.actions.updatingRole,
																		onCheckedChange: () => {
																			toEditUser.role_ids = toggleRole(role.id, toEditUser.role_ids);
																		}
																	});

																	$$renderer.push(`<!----> <span class="text-sm uppercase">${$.escape(role.role_name)}</span></label>`);
																}

																$$renderer.push(`<!--]--> `);

																if (activeRoles().length === 0) {
																	$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">No roles available</p>`);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--></div> `);

																Button($$renderer, {
																	variant: 'secondary',
																	class: 'mt-3',
																	disabled: toEditUser.actions.updatingRole || toEditUser.role_ids.length === 0,
																	onclick: () => {
																		toEditUser.actions.updatingRole = true;

																		manualUpdateData("role").then(() => {
																			toEditUser.actions.updatingRole = false;
																		});
																	},

																	children: ($$renderer) => {
																		if (toEditUser.actions.updatingRole) {
																			$$renderer.push('<!--[0-->');
																			Spinner($$renderer, { class: 'size-4' });
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]--> Update Roles`);
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

										$$renderer.push(` `);

										if (toEditUser.is_active) {
											$$renderer.push('<!--[0-->');

											if (Card.Root) {
												$$renderer.push('<!--[-->');

												Card.Root($$renderer, {
													class: 'border-destructive',
													children: ($$renderer) => {
														if (Card.Content) {
															$$renderer.push('<!--[-->');

															Card.Content($$renderer, {
																class: 'p-4',
																children: ($$renderer) => {
																	$$renderer.push(`<p class="mb-3 text-sm">Deactivate User. The user will not be able to login. Existing session will get invalidated.</p> `);

																	Button($$renderer, {
																		variant: 'destructive',
																		disabled: toEditUser.actions.deactivatingUser,
																		onclick: () => {
																			toEditUser.actions.deactivatingUser = true;
																			toEditUser.is_active = 0;

																			manualUpdateData("is_active").then(() => {
																				toEditUser.actions.deactivatingUser = false;
																			});
																		},

																		children: ($$renderer) => {
																			if (toEditUser.actions.deactivatingUser) {
																				$$renderer.push('<!--[0-->');
																				Spinner($$renderer, { class: 'size-4' });
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> Deactivate User`);
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
										} else {
											$$renderer.push('<!--[-1-->');

											if (Card.Root) {
												$$renderer.push('<!--[-->');

												Card.Root($$renderer, {
													children: ($$renderer) => {
														if (Card.Content) {
															$$renderer.push('<!--[-->');

															Card.Content($$renderer, {
																class: 'p-4',
																children: ($$renderer) => {
																	$$renderer.push(`<p class="mb-3 text-sm">Activate User. The user will be able to login.</p> `);

																	Button($$renderer, {
																		variant: 'secondary',
																		disabled: toEditUser.actions.activatingUser,
																		onclick: () => {
																			toEditUser.actions.activatingUser = true;
																			toEditUser.is_active = 1;

																			manualUpdateData("is_active").then(() => {
																				toEditUser.actions.activatingUser = false;
																			});
																		},

																		children: ($$renderer) => {
																			if (toEditUser.actions.activatingUser) {
																				$$renderer.push('<!--[0-->');
																				Spinner($$renderer, { class: 'size-4' });
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> Activate User`);
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
										}

										$$renderer.push(`<!--]--> `);

										if (manualUpdateError) {
											$$renderer.push('<!--[0-->');

											if (Alert.Root) {
												$$renderer.push('<!--[-->');

												Alert.Root($$renderer, {
													variant: 'destructive',
													children: ($$renderer) => {
														if (Alert.Description) {
															$$renderer.push('<!--[-->');

															Alert.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(manualUpdateError)}`);
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (manualSuccess) {
											$$renderer.push('<!--[0-->');

											if (Alert.Root) {
												$$renderer.push('<!--[-->');

												Alert.Root($$renderer, {
													class: 'border-green-500 text-green-500',
													children: ($$renderer) => {
														if (Alert.Description) {
															$$renderer.push('<!--[-->');

															Alert.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(manualSuccess)}`);
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}