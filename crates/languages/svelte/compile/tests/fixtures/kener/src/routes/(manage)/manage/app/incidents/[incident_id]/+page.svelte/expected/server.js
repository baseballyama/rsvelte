import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import PlusIcon from "@lucide/svelte/icons/plus";
import TrashIcon from "@lucide/svelte/icons/trash";
import PencilIcon from "@lucide/svelte/icons/pencil";
import XIcon from "@lucide/svelte/icons/x";
import MoreVerticalIcon from "@lucide/svelte/icons/more-vertical";
import CheckIcon from "@lucide/svelte/icons/check";
import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import { format } from "date-fns";
import GC from "$lib/global-constants";
import { mode } from "mode-watcher";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import CodeMirror from "svelte-codemirror-editor";
import { markdown } from "@codemirror/lang-markdown";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import mdToHTML from "$lib/marked";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params } = $$props;
		const isNew = $.derived(() => params.incident_id === "new");

		// Form state
		let loading = true;

		let saving = false;
		let error = null;

		// Incident data
		let incident = {
			id: 0,
			title: "",
			start_date_time: Math.floor(Date.now() / 1000),
			status: "OPEN",
			state: GC.INVESTIGATING,
			is_global: "YES"
		};

		// For datetime inputs (convert to/from local datetime string)
		let startDateTimeLocal = "";

		// First comment for new incidents
		let firstComment = "";

		// Comments for existing incidents
		let comments = [];

		let loadingComments = false;

		// Monitors
		let availableMonitors = [];

		let incidentMonitors = [];
		let originalMonitors = [];
		let addMonitorDialogOpen = false;
		let selectedMonitorTag = "";
		let selectedMonitorImpact = "DOWN";
		let addingMonitor = false;

		// Comment inline editing/adding
		let addingNewComment = false;

		let editingCommentId = null;
		let commentText = "";
		let commentState = GC.INVESTIGATING;
		let commentDateTime = "";
		let savingComment = false;
		const states = [GC.INVESTIGATING, GC.IDENTIFIED, GC.MONITORING, GC.RESOLVED];

		// Convert timestamp to local datetime string for input (YYYY-MM-DDTHH:MM format)
		function timestampToLocalDatetime(ts) {
			const date = new Date(ts * 1000);

			// Format as YYYY-MM-DDTHH:MM in local time
			const year = date.getFullYear();

			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			const hours = String(date.getHours()).padStart(2, "0");
			const minutes = String(date.getMinutes()).padStart(2, "0");

			return `${year}-${month}-${day}T${hours}:${minutes}`;
		}

		// Convert local datetime string to timestamp (stores as UTC)
		function localDatetimeToTimestamp(datetime) {
			if (!datetime) return Math.floor(Date.now() / 1000);

			const date = new Date(datetime);

			return Math.floor(date.getTime() / 1000);
		}

		// Sync datetime inputs with incident state
		// Update incident timestamps when inputs change
		function handleStartDateChange(e) {
			const target = e.target;

			startDateTimeLocal = target.value;
			incident.start_date_time = localDatetimeToTimestamp(target.value);
		}

		// Validation
		const isValid = $.derived(() => incident.title.trim() !== "" && incident.start_date_time > 0);

		// Fetch incident data
		async function fetchIncident() {
			if (isNew()) {
				loading = false;

				return;
			}

			loading = true;
			error = null;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getIncident",
						data: { incident_id: parseInt(params.incident_id) }
					})
				});

				const result = await response.json();

				if (result.error) {
					error = result.error;
				} else if (result) {
					incident = {
						id: result.id,
						title: result.title,
						start_date_time: result.start_date_time,
						status: result.status,
						state: result.state,
						is_global: result.is_global || "YES"
					};

					// Fetch comments and monitors
					await Promise.all([fetchComments(), fetchIncidentMonitors()]);
				} else {
					error = "Incident not found";
				}
			} catch(e) {
				error = e instanceof Error ? e.message : "Failed to fetch incident";
			} finally {
				loading = false;
			}
		}

		// Fetch comments
		async function fetchComments() {
			if (isNew()) return;

			loadingComments = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getComments",
						data: { incident_id: parseInt(params.incident_id) }
					})
				});

				const result = await response.json();

				if (!result.error) {
					comments = result;
				}
			} catch {
				// Ignore errors
			} finally {
				loadingComments = false;
			}
		}

		// Fetch incident monitors
		async function fetchIncidentMonitors() {
			if (isNew()) return;

			try {
				// We get monitors from the getIncident response - need to fetch full incident data
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getIncidents",
						data: { page: 1, limit: 100, filter: { status: "ALL" } }
					})
				});

				const result = await response.json();

				if (!result.error && result.incidents) {
					const found = result.incidents.find((i) => i.id === parseInt(params.incident_id));

					if (found && found.monitors) {
						incidentMonitors = found.monitors.map((m) => ({
							monitor_tag: m.tag || m.monitor_tag,
							monitor_impact: m.impact_type || m.monitor_impact
						}));

						// Store original monitors to compare on save
						originalMonitors = [...incidentMonitors];
					}
				}
			} catch {
				// Ignore errors
			}
		}

		// Fetch available monitors
		async function fetchAvailableMonitors() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitors", data: { status: "ACTIVE" } })
				});

				const result = await response.json();

				if (!result.error) {
					availableMonitors = result;
				}
			} catch {
				// Ignore errors
			}
		}

		// Save incident (create or update)
		async function saveIncident() {
			if (!isValid()) return;

			saving = true;
			error = null;

			try {
				if (isNew()) {
					// Create new incident
					const response = await fetch(clientResolver(resolve, "/manage/api"), {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							action: "createIncident",
							data: {
								title: incident.title,
								start_date_time: incident.start_date_time,
								end_date_time: null,
								status: "OPEN",
								state: GC.INVESTIGATING,
								incident_type: GC.INCIDENT,
								is_global: incident.is_global
							}
						})
					});

					const result = await response.json();

					if (result.error) {
						toast.error(result.error);
					} else {
						const incidentId = result.incident_id;

						// Add monitors
						for (const monitor of incidentMonitors) {
							await fetch(clientResolver(resolve, "/manage/api"), {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									action: "addMonitor",
									data: {
										incident_id: incidentId,
										monitor_tag: monitor.monitor_tag,
										monitor_impact: monitor.monitor_impact
									}
								})
							});
						}

						// Add first comment if provided
						if (firstComment.trim()) {
							await fetch(clientResolver(resolve, "/manage/api"), {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									action: "addComment",
									data: {
										incident_id: incidentId,
										comment: firstComment,
										state: GC.INVESTIGATING,
										commented_at: incident.start_date_time
									}
								})
							});
						}

						toast.success("Incident created successfully");
						goto(clientResolver(resolve, `/manage/app/incidents/${incidentId}`));
					}
				} else {
					// Update existing incident
					const response = await fetch(clientResolver(resolve, "/manage/api"), {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							action: "updateIncident",
							data: {
								id: incident.id,
								title: incident.title,
								start_date_time: incident.start_date_time,
								end_date_time: null,
								status: "OPEN",
								is_global: incident.is_global
							}
						})
					});

					const result = await response.json();

					if (result.error) {
						toast.error(result.error);
					} else {
						// Sync monitors - find added, removed, and changed
						const originalTags = originalMonitors.map((m) => m.monitor_tag);

						const currentTags = incidentMonitors.map((m) => m.monitor_tag);

						// Monitors to add (in current but not in original)
						const toAdd = incidentMonitors.filter((m) => !originalTags.includes(m.monitor_tag));

						// Monitors to remove (in original but not in current)
						const toRemove = originalMonitors.filter((m) => !currentTags.includes(m.monitor_tag));

						// Monitors with changed impact (in both but impact is different)
						const toUpdate = incidentMonitors.filter((m) => {
							const original = originalMonitors.find((o) => o.monitor_tag === m.monitor_tag);

							return original && original.monitor_impact !== m.monitor_impact;
						});

						// Add new monitors
						for (const monitor of toAdd) {
							await fetch(clientResolver(resolve, "/manage/api"), {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									action: "addMonitor",
									data: {
										incident_id: incident.id,
										monitor_tag: monitor.monitor_tag,
										monitor_impact: monitor.monitor_impact
									}
								})
							});
						}

						// Update monitors with changed impact
						for (const monitor of toUpdate) {
							await fetch(clientResolver(resolve, "/manage/api"), {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									action: "addMonitor",
									data: {
										incident_id: incident.id,
										monitor_tag: monitor.monitor_tag,
										monitor_impact: monitor.monitor_impact
									}
								})
							});
						}

						// Remove deleted monitors
						for (const monitor of toRemove) {
							await fetch(clientResolver(resolve, "/manage/api"), {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									action: "removeMonitor",
									data: { incident_id: incident.id, monitor_tag: monitor.monitor_tag }
								})
							});
						}

						// Update originalMonitors to reflect current state
						originalMonitors = [...incidentMonitors];

						toast.success("Changes saved successfully");
					}
				}
			} catch(e) {
				toast.error(e instanceof Error ? e.message : "Failed to save");
			} finally {
				saving = false;
			}
		}

		// Add monitor to incident
		async function addMonitorToIncident() {
			if (!selectedMonitorTag || !incident.id) return;

			addingMonitor = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "addMonitor",
						data: {
							incident_id: incident.id,
							monitor_tag: selectedMonitorTag,
							monitor_impact: selectedMonitorImpact
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitor added to incident");
					await fetchIncidentMonitors();
					addMonitorDialogOpen = false;
					selectedMonitorTag = "";
					selectedMonitorImpact = "DOWN";
				}
			} catch(e) {
				toast.error("Failed to add monitor");
			} finally {
				addingMonitor = false;
			}
		}

		// Remove monitor from incident
		async function removeMonitorFromIncident(monitorTag) {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "removeMonitor",
						data: { incident_id: incident.id, monitor_tag: monitorTag }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitor removed from incident");
					await fetchIncidentMonitors();
				}
			} catch {
				toast.error("Failed to remove monitor");
			}
		}

		// Start editing a comment (inline)
		function startEditComment(comment) {
			editingCommentId = comment.id;
			commentText = comment.comment;
			commentState = comment.state;
			commentDateTime = timestampToLocalDatetime(comment.commented_at);
		}

		// Cancel editing
		function cancelEditComment() {
			editingCommentId = null;
			commentText = "";
			commentState = incident.state;
			commentDateTime = "";
		}

		// Start adding new comment (inline)
		function startAddComment() {
			addingNewComment = true;
			editingCommentId = null;
			commentText = "";
			commentState = incident.state;
			commentDateTime = timestampToLocalDatetime(Math.floor(Date.now() / 1000));
		}

		// Cancel adding new comment
		function cancelAddComment() {
			addingNewComment = false;
			commentText = "";
			commentState = incident.state;
			commentDateTime = "";
		}

		// Save comment (add or edit)
		async function saveComment() {
			if (!commentText.trim()) return;

			savingComment = true;

			try {
				if (editingCommentId !== null) {
					// Update existing comment
					const response = await fetch(clientResolver(resolve, "/manage/api"), {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							action: "updateComment",
							data: {
								incident_id: incident.id,
								comment_id: editingCommentId,
								comment: commentText,
								state: commentState,
								commented_at: localDatetimeToTimestamp(commentDateTime)
							}
						})
					});

					const result = await response.json();

					if (result.error) {
						toast.error(result.error);
					} else {
						toast.success("Update saved");
						await fetchComments();
						await fetchIncident();
						cancelEditComment();
					}
				} else {
					// Add new comment
					const response = await fetch(clientResolver(resolve, "/manage/api"), {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							action: "addComment",
							data: {
								incident_id: incident.id,
								comment: commentText,
								state: commentState,
								commented_at: localDatetimeToTimestamp(commentDateTime)
							}
						})
					});

					const result = await response.json();

					if (result.error) {
						toast.error(result.error);
					} else {
						toast.success("Update added");
						await fetchComments();
						await fetchIncident();
						cancelAddComment();
					}
				}
			} catch {
				toast.error("Failed to save update");
			} finally {
				savingComment = false;
			}
		}

		// Delete comment
		async function deleteComment(commentId) {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteComment",
						data: { incident_id: incident.id, comment_id: commentId }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Update deleted");
					await fetchComments();
				}
			} catch {
				toast.error("Failed to delete update");
			}
		}

		// Add monitor to list (for new incidents, just adds to local array)
		function addMonitorToList() {
			if (!selectedMonitorTag) return;

			incidentMonitors = [
				...incidentMonitors,
				{
					monitor_tag: selectedMonitorTag,
					monitor_impact: selectedMonitorImpact
				}
			];

			addMonitorDialogOpen = false;
			selectedMonitorTag = "";
			selectedMonitorImpact = "DOWN";
		}

		// Remove monitor from list (for new incidents)
		function removeMonitorFromList(monitorTag) {
			incidentMonitors = incidentMonitors.filter((m) => m.monitor_tag !== monitorTag);
		}

		// Update monitor impact in list
		function updateMonitorImpact(monitorTag, newImpact) {
			incidentMonitors = incidentMonitors.map((m) => m.monitor_tag === monitorTag ? { ...m, monitor_impact: newImpact } : m);
		}

		// Get state badge variant
		function getStateBadgeVariant(state) {
			switch (state) {
				case GC.RESOLVED:
					return "default";

				case GC.MONITORING:
					return "secondary";

				case GC.IDENTIFIED:
					return "outline";

				case GC.INVESTIGATING:

				default:
					return "destructive";
			}
		}

		// Get impact badge variant
		function getImpactBadgeVariant(impact) {
			switch (impact) {
				case "DOWN":
					return "destructive";

				case "DEGRADED":
					return "secondary";

				case "MAINTENANCE":
					return "outline";

				default:
					return "default";
			}
		}

		// Get monitor name by tag
		function getMonitorName(tag) {
			const monitor = availableMonitors.find((m) => m.tag === tag);

			return monitor?.name || tag;
		}

		// Get unassigned monitors
		const unassignedMonitors = $.derived(() => availableMonitors.filter((m) => !incidentMonitors.some((im) => im.monitor_tag === m.tag)));

		// Delete incident
		let deleteDialogOpen = false;

		let deleteConfirmText = "";
		let deleting = false;
		const deleteConfirmPhrase = $.derived(() => `delete incident ${params.incident_id}`);
		const deleteConfirmed = $.derived(() => deleteConfirmText === deleteConfirmPhrase());

		async function deleteIncident() {
			if (!deleteConfirmed()) return;

			deleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteIncident",
						data: { incident_id: parseInt(params.incident_id) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Incident deleted successfully");
					window.location.replace(clientResolver(resolve, "/manage/app/incidents"));
				}
			} catch {
				toast.error("Failed to delete incident");
			} finally {
				deleting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container space-y-6 py-6"><div class="flex justify-between gap-2">`);

			if (Breadcrumb.Root) {
				$$renderer.push('<!--[-->');

				Breadcrumb.Root($$renderer, {
					children: ($$renderer) => {
						if (Breadcrumb.List) {
							$$renderer.push('<!--[-->');

							Breadcrumb.List($$renderer, {
								children: ($$renderer) => {
									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Link) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Link($$renderer, {
														href: clientResolver(resolve, "/manage/app/incidents"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Incidents`);
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

									if (Breadcrumb.Separator) {
										$$renderer.push('<!--[-->');
										Breadcrumb.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Page) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Page($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(isNew()
																? "New Incident"
																: `Edit Incident #${params.incident_id}`)}`);
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

			$$renderer.push(` <div class="flex gap-2">`);

			if (!isNew()) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					target: '_blank',
					size: 'sm',
					href: clientResolver(resolve, `/incidents/${params.incident_id}`),
					children: ($$renderer) => {
						$$renderer.push(`<!---->View`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (Dialog.Root) {
					$$renderer.push('<!--[-->');

					Dialog.Root($$renderer, {
						onOpenChange: () => deleteConfirmText = "",
						get open() {
							return deleteDialogOpen;
						},

						set open($$value) {
							deleteDialogOpen = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										props,
										{
											variant: 'destructive',
											size: 'sm',
											children: ($$renderer) => {
												TrashIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----> Delete`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Dialog.Trigger) {
									$$renderer.push('<!--[-->');
									Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

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
																$$renderer.push(`<!---->Delete Incident`);
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
																$$renderer.push(`<!---->This action cannot be undone. This will permanently delete the incident, its updates, and remove all
                associated monitor links.`);
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

										$$renderer.push(` <div class="space-y-4 py-4"><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Type <span class="font-mono font-semibold">${$.escape(deleteConfirmPhrase())}</span> to confirm`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											placeholder: deleteConfirmPhrase(),
											get value() {
												return deleteConfirmText;
											},

											set value($$value) {
												deleteConfirmText = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div> `);

										if (Dialog.Footer) {
											$$renderer.push('<!--[-->');

											Dialog.Footer($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														variant: 'outline',
														onclick: () => deleteDialogOpen = false,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'destructive',
														onclick: deleteIncident,
														disabled: !deleteConfirmed() || deleting,
														children: ($$renderer) => {
															if (deleting) {
																$$renderer.push('<!--[0-->');
																Loader($$renderer, { class: 'size-4 animate-spin' });
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> Delete Incident`);
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----></div>`);
			} else if (error) {
				$$renderer.push('<!--[1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'border-destructive',
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center gap-2">`);
										AlertTriangleIcon($$renderer, { class: 'text-destructive size-5' });
										$$renderer.push(`<!----> <p class="text-destructive">${$.escape(error)}</p></div>`);
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
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(isNew() ? "Create New Incident" : "Incident Details")}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Card.Description) {
											$$renderer.push('<!--[-->');

											Card.Description($$renderer, {
												children: ($$renderer) => {
													if (isNew()) {
														$$renderer.push(`<!--[0-->Create a new incident to track`);
													} else {
														$$renderer.push(`<!--[-1-->Edit incident details and manage updates`);
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

							$$renderer.push(` `);

							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'space-y-6',
									children: ($$renderer) => {
										if (!isNew()) {
											$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

											Badge($$renderer, {
												variant: 'outline',
												class: `text-${$.stringify(incident.state.toLowerCase())} border-${$.stringify(incident.state.toLowerCase())} font-semibold`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(incident.state)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'incident-title',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Title <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'incident-title',
											placeholder: 'Brief description of the incident',
											get value() {
												return incident.title;
											},

											set value($$value) {
												incident.title = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'incident-start',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Start Date/Time <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'incident-start',
											type: 'datetime-local',
											value: startDateTimeLocal,
											onchange: handleStartDateChange
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Enter time in your local timezone. It will be stored as UTC.</p></div> <div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col gap-1">`);

										Label($$renderer, {
											for: 'is-global',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Global Incident`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">When enabled, this incident will be visible on all status pages</p></div> `);

										Switch($$renderer, {
											id: 'is-global',
											checked: incident.is_global === "YES",
											onCheckedChange: (checked) => {
												incident.is_global = checked ? "YES" : "NO";
											}
										});

										$$renderer.push(`<!----></div> `);

										if (isNew()) {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												for: 'first-comment',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Initial Update (Optional)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="overflow-hidden rounded-md border">`);

											CodeMirror($$renderer, {
												lang: markdown(),
												theme: mode.current === "dark" ? githubDark : githubLight,
												styles: { "&": { width: "100%", maxWidth: "100%", height: "160px" } },
												get value() {
													return firstComment;
												},

												set value($$value) {
													firstComment = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <p class="text-muted-foreground text-xs">Supports Markdown. This will be added as the first update for this incident.</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="flex flex-col gap-2"><div class="flex items-center justify-between">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Affected Monitors (Optional)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Dialog.Root) {
											$$renderer.push('<!--[-->');

											Dialog.Root($$renderer, {
												get open() {
													return addMonitorDialogOpen;
												},

												set open($$value) {
													addMonitorDialogOpen = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															Button($$renderer, $.spread_props([
																props,
																{
																	size: 'sm',
																	variant: 'outline',
																	disabled: unassignedMonitors().length === 0,
																	children: ($$renderer) => {
																		PlusIcon($$renderer, { class: 'size-4' });
																		$$renderer.push(`<!----> Add Monitor`);
																	},
																	$$slots: { default: true }
																}
															]));
														}

														if (Dialog.Trigger) {
															$$renderer.push('<!--[-->');
															Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(` `);

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
																						$$renderer.push(`<!---->Add Affected Monitor`);
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
																						$$renderer.push(`<!---->Select a monitor and its impact level`);
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

																$$renderer.push(` <div class="space-y-4 py-4"><div class="flex flex-col gap-2">`);

																Label($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Monitor`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																if (Select.Root) {
																	$$renderer.push('<!--[-->');

																	Select.Root($$renderer, {
																		type: 'single',
																		value: selectedMonitorTag,
																		onValueChange: (v) => {
																			if (v) selectedMonitorTag = v;
																		},

																		children: ($$renderer) => {
																			if (Select.Trigger) {
																				$$renderer.push('<!--[-->');

																				Select.Trigger($$renderer, {
																					class: 'w-full',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(selectedMonitorTag
																							? getMonitorName(selectedMonitorTag)
																							: "Select a monitor")}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Select.Content) {
																				$$renderer.push('<!--[-->');

																				Select.Content($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array = $.ensure_array_like(unassignedMonitors());

																						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																							let monitor = each_array[$$index];

																							if (Select.Item) {
																								$$renderer.push('<!--[-->');

																								Select.Item($$renderer, {
																									value: monitor.tag,
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(monitor.name)}`);
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

																$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

																Label($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Impact Level`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																if (Select.Root) {
																	$$renderer.push('<!--[-->');

																	Select.Root($$renderer, {
																		type: 'single',
																		value: selectedMonitorImpact,
																		onValueChange: (v) => {
																			if (v) selectedMonitorImpact = v;
																		},

																		children: ($$renderer) => {
																			if (Select.Trigger) {
																				$$renderer.push('<!--[-->');

																				Select.Trigger($$renderer, {
																					class: 'w-full',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(selectedMonitorImpact)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Select.Content) {
																				$$renderer.push('<!--[-->');

																				Select.Content($$renderer, {
																					children: ($$renderer) => {
																						if (Select.Item) {
																							$$renderer.push('<!--[-->');

																							Select.Item($$renderer, {
																								value: 'DOWN',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Down`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Select.Item) {
																							$$renderer.push('<!--[-->');

																							Select.Item($$renderer, {
																								value: 'DEGRADED',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Degraded`);
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

																$$renderer.push(`</div></div> `);

																if (Dialog.Footer) {
																	$$renderer.push('<!--[-->');

																	Dialog.Footer($$renderer, {
																		children: ($$renderer) => {
																			Button($$renderer, {
																				variant: 'outline',
																				onclick: () => addMonitorDialogOpen = false,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Cancel`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			Button($$renderer, {
																				onclick: addMonitorToList,
																				disabled: !selectedMonitorTag,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Add Monitor`);
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

										$$renderer.push(`</div> `);

										if (incidentMonitors.length === 0) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">No monitors selected</p>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="space-y-2"><!--[-->`);

											const each_array_1 = $.ensure_array_like(incidentMonitors);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let monitor = each_array_1[$$index_1];

												$$renderer.push(`<div class="flex items-center justify-between rounded-md border p-3"><div class="flex items-center gap-3"><span class="font-medium">${$.escape(getMonitorName(monitor.monitor_tag))}</span> `);

												Badge($$renderer, {
													variant: 'outline',
													class: `text-${$.stringify(monitor.monitor_impact?.toLowerCase() || 'default')} font-semibold border-${$.stringify(monitor.monitor_impact?.toLowerCase() || 'default')}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(monitor.monitor_impact || "Unknown")}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div> `);

												if (DropdownMenu.Root) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	Button($$renderer, $.spread_props([
																		props,
																		{
																			variant: 'ghost',
																			size: 'icon',
																			children: ($$renderer) => {
																				MoreVerticalIcon($$renderer, { class: 'size-4' });
																			},
																			$$slots: { default: true }
																		}
																	]));
																}

																if (DropdownMenu.Trigger) {
																	$$renderer.push('<!--[-->');
																	DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(` `);

															if (DropdownMenu.Content) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Content($$renderer, {
																	align: 'end',
																	children: ($$renderer) => {
																		if (DropdownMenu.Label) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Label($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Update Impact`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Group) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Group($$renderer, {
																				children: ($$renderer) => {
																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							class: 'cursor-pointer',
																							onclick: () => updateMonitorImpact(monitor.monitor_tag, "DOWN"),
																							children: ($$renderer) => {
																								$$renderer.push(`<span class="flex items-center gap-2">`);

																								if (monitor.monitor_impact === "DOWN") {
																									$$renderer.push('<!--[0-->');
																									CheckIcon($$renderer, { class: 'size-4' });
																								} else {
																									$$renderer.push(`<!--[-1--><span class="size-4"></span>`);
																								}

																								$$renderer.push(`<!--]--> Down</span>`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							class: 'cursor-pointer',
																							onclick: () => updateMonitorImpact(monitor.monitor_tag, "DEGRADED"),
																							children: ($$renderer) => {
																								$$renderer.push(`<span class="flex items-center gap-2">`);

																								if (monitor.monitor_impact === "DEGRADED") {
																									$$renderer.push('<!--[0-->');
																									CheckIcon($$renderer, { class: 'size-4' });
																								} else {
																									$$renderer.push(`<!--[-1--><span class="size-4"></span>`);
																								}

																								$$renderer.push(`<!--]--> Degraded</span>`);
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

																		if (DropdownMenu.Separator) {
																			$$renderer.push('<!--[-->');
																			DropdownMenu.Separator($$renderer, {});
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				class: 'text-destructive cursor-pointer',
																				onclick: () => removeMonitorFromList(monitor.monitor_tag),
																				children: ($$renderer) => {
																					TrashIcon($$renderer, { class: 'size-4' });
																					$$renderer.push(`<!----> Remove`);
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

												$$renderer.push(`</div>`);
											}

											$$renderer.push(`<!--]--></div>`);
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

							$$renderer.push(` `);

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-end',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveIncident,
											disabled: saving || !isValid(),
											children: ($$renderer) => {
												if (saving) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'size-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'size-4' });
												}

												$$renderer.push(`<!--]--> ${$.escape(isNew() ? "Create Incident" : "Save Changes")}`);
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
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (!isNew()) {
					$$renderer.push('<!--[0-->');

					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="flex items-center justify-between"><div>`);

											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Updates`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Description) {
												$$renderer.push('<!--[-->');

												Card.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Timeline of status updates for this incident`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div> `);

											if (!addingNewComment) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													size: 'sm',
													onclick: startAddComment,
													children: ($$renderer) => {
														PlusIcon($$renderer, { class: 'size-4' });
														$$renderer.push(`<!----> Add Update`);
													},
													$$slots: { default: true }
												});
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

								$$renderer.push(` `);

								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											if (addingNewComment) {
												$$renderer.push(`<!--[0--><div class="mb-4 space-y-4 rounded-md border p-4"><div class="flex flex-col gap-2">`);

												Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Update Message`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> <div class="overflow-hidden rounded-md border">`);

												CodeMirror($$renderer, {
													lang: markdown(),
													theme: mode.current === "dark" ? githubDark : githubLight,
													styles: { "&": { width: "100%", maxWidth: "100%", height: "120px" } },
													get value() {
														return commentText;
													},

													set value($$value) {
														commentText = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div> <p class="text-muted-foreground text-xs">Supports Markdown formatting</p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

												Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->State`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												if (Select.Root) {
													$$renderer.push('<!--[-->');

													Select.Root($$renderer, {
														type: 'single',
														value: commentState,
														onValueChange: (v) => {
															if (v) commentState = v;
														},

														children: ($$renderer) => {
															if (Select.Trigger) {
																$$renderer.push('<!--[-->');

																Select.Trigger($$renderer, {
																	class: 'w-full',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(commentState)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Content) {
																$$renderer.push('<!--[-->');

																Select.Content($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_2 = $.ensure_array_like(states);

																		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																			let state = each_array_2[$$index_2];

																			if (Select.Item) {
																				$$renderer.push('<!--[-->');

																				Select.Item($$renderer, {
																					value: state,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(state)}`);
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

												$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

												Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Date/Time`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													type: 'datetime-local',
													get value() {
														return commentDateTime;
													},

													set value($$value) {
														commentDateTime = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div> <div class="flex justify-end gap-2">`);

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: cancelAddComment,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													size: 'sm',
													onclick: saveComment,
													disabled: !commentText.trim() || savingComment,
													children: ($$renderer) => {
														if (savingComment) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'size-4 animate-spin' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Add Update`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (loadingComments) {
												$$renderer.push(`<!--[0--><div class="flex justify-center py-4">`);
												Spinner($$renderer, { class: 'size-6' });
												$$renderer.push(`<!----></div>`);
											} else if (comments.length === 0 && !addingNewComment) {
												$$renderer.push(`<!--[1--><p class="text-muted-foreground py-4 text-center text-sm">No updates yet</p>`);
											} else {
												$$renderer.push(`<!--[-1--><div class="space-y-4"><!--[-->`);

												const each_array_3 = $.ensure_array_like(comments);

												for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
													let comment = each_array_3[$$index_4];

													$$renderer.push(`<div class="rounded-md border p-4">`);

													if (editingCommentId === comment.id) {
														$$renderer.push(`<!--[0--><div class="space-y-4"><div class="flex flex-col gap-2">`);

														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Update Message`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> <div class="overflow-hidden rounded-md border">`);

														CodeMirror($$renderer, {
															lang: markdown(),
															theme: mode.current === "dark" ? githubDark : githubLight,
															styles: { "&": { width: "100%", maxWidth: "100%", height: "120px" } },
															get value() {
																return commentText;
															},

															set value($$value) {
																commentText = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----></div> <p class="text-muted-foreground text-xs">Supports Markdown formatting</p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->State`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														if (Select.Root) {
															$$renderer.push('<!--[-->');

															Select.Root($$renderer, {
																type: 'single',
																value: commentState,
																onValueChange: (v) => {
																	if (v) commentState = v;
																},

																children: ($$renderer) => {
																	if (Select.Trigger) {
																		$$renderer.push('<!--[-->');

																		Select.Trigger($$renderer, {
																			class: 'w-full',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(commentState)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Content) {
																		$$renderer.push('<!--[-->');

																		Select.Content($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_4 = $.ensure_array_like(states);

																				for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
																					let state = each_array_4[$$index_3];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: state,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(state)}`);
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

														$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Date/Time`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Input($$renderer, {
															type: 'datetime-local',
															get value() {
																return commentDateTime;
															},

															set value($$value) {
																commentDateTime = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----></div></div> <div class="flex justify-end gap-2">`);

														Button($$renderer, {
															variant: 'outline',
															size: 'sm',
															onclick: cancelEditComment,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															size: 'sm',
															onclick: saveComment,
															disabled: !commentText.trim() || savingComment,
															children: ($$renderer) => {
																if (savingComment) {
																	$$renderer.push('<!--[0-->');
																	Loader($$renderer, { class: 'size-4 animate-spin' });
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--> Save`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></div></div>`);
													} else {
														$$renderer.push(`<!--[-1--><div class="flex items-start justify-between"><div class="flex-1 space-y-2"><div class="flex items-center gap-2">`);

														Badge($$renderer, {
															variant: getStateBadgeVariant(comment.state),
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(comment.state)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">${$.escape(format(new Date(comment.commented_at * 1000), "MMM d, yyyy HH:mm"))}</span></div> <div class="kener-md prose prose-neutral dark:prose-invert prose-code:rounded prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-pre:bg-opacity-0 dark:prose-pre:bg-neutral-800 max-w-none">`);
														SveltePurify($$renderer, { html: mdToHTML(comment.comment) });
														$$renderer.push(`<!----></div></div> <div class="ml-4 flex gap-1">`);

														Button($$renderer, {
															variant: 'ghost',
															size: 'icon',
															onclick: () => startEditComment(comment),
															children: ($$renderer) => {
																PencilIcon($$renderer, { class: 'size-4' });
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															variant: 'ghost',
															size: 'icon',
															onclick: () => deleteComment(comment.id),
															children: ($$renderer) => {
																TrashIcon($$renderer, { class: 'size-4' });
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></div></div>`);
													}

													$$renderer.push(`<!--]--></div>`);
												}

												$$renderer.push(`<!--]--></div>`);
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}