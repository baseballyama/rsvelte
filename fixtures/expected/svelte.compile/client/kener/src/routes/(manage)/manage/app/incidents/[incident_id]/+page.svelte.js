import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> Delete`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`Type <span class="font-mono font-semibold"> </span> to confirm`, 1);
var root_4 = $.from_html(`<!> Delete Incident`, 1);
var root_5 = $.from_html(`<!> <div class="space-y-4 py-4"><div class="flex flex-col gap-2"><!> <!></div></div> <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_7 = $.from_html(`<div class="flex items-center gap-2"><!> <p class="text-destructive"> </p></div>`);
var root_8 = $.from_html(`<div class="flex items-center gap-2"><!></div>`);
var root_9 = $.from_html(`Title <span class="text-destructive">*</span>`, 1);
var root_10 = $.from_html(`Start Date/Time <span class="text-destructive">*</span>`, 1);
var root_11 = $.from_html(`<div class="flex flex-col gap-2"><!> <div class="overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground text-xs">Supports Markdown. This will be added as the first update for this incident.</p></div>`);
var root_12 = $.from_html(`<!> Add Monitor`, 1);
var root_13 = $.from_html(`<!> <div class="space-y-4 py-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <!>`, 1);
var root_14 = $.from_html(`<p class="text-muted-foreground text-sm">No monitors selected</p>`);
var root_15 = $.from_html(`<span class="size-4"></span>`);
var root_16 = $.from_html(`<span class="flex items-center gap-2"><!> Down</span>`);
var root_17 = $.from_html(`<span class="flex items-center gap-2"><!> Degraded</span>`);
var root_18 = $.from_html(`<!> Remove`, 1);
var root_19 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_20 = $.from_html(`<div class="flex items-center justify-between rounded-md border p-3"><div class="flex items-center gap-3"><span class="font-medium"> </span> <!></div> <!></div>`);
var root_21 = $.from_html(`<div class="space-y-2"></div>`);
var root_22 = $.from_html(`<!> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Enter time in your local timezone. It will be stored as UTC.</p></div> <div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col gap-1"><!> <p class="text-muted-foreground text-xs">When enabled, this incident will be visible on all status pages</p></div> <!></div> <!> <div class="flex flex-col gap-2"><div class="flex items-center justify-between"><!> <!></div> <!></div>`, 1);
var root_23 = $.from_html(`<!> `, 1);
var root_24 = $.from_html(`<!> Add Update`, 1);
var root_25 = $.from_html(`<div class="flex items-center justify-between"><div><!> <!></div> <!></div>`);
var root_26 = $.from_html(`<div class="mb-4 space-y-4 rounded-md border p-4"><div class="flex flex-col gap-2"><!> <div class="overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground text-xs">Supports Markdown formatting</p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="flex justify-end gap-2"><!> <!></div></div>`);
var root_27 = $.from_html(`<div class="flex justify-center py-4"><!></div>`);
var root_28 = $.from_html(`<p class="text-muted-foreground py-4 text-center text-sm">No updates yet</p>`);
var root_29 = $.from_html(`<!> Save`, 1);
var root_30 = $.from_html(`<div class="space-y-4"><div class="flex flex-col gap-2"><!> <div class="overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground text-xs">Supports Markdown formatting</p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="flex justify-end gap-2"><!> <!></div></div>`);
var root_31 = $.from_html(`<div class="flex items-start justify-between"><div class="flex-1 space-y-2"><div class="flex items-center gap-2"><!> <span class="text-muted-foreground text-sm"> </span></div> <div class="kener-md prose prose-neutral dark:prose-invert prose-code:rounded prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-pre:bg-opacity-0 dark:prose-pre:bg-neutral-800 max-w-none"><!></div></div> <div class="ml-4 flex gap-1"><!> <!></div></div>`);
var root_32 = $.from_html(`<div class="rounded-md border p-4"><!></div>`);
var root_33 = $.from_html(`<div class="space-y-4"></div>`);
var root_34 = $.from_html(`<div class="container space-y-6 py-6"><div class="flex justify-between gap-2"><!> <div class="flex gap-2"><!></div></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const isNew = $.derived(() => $$props.params.incident_id === "new");

	// Form state
	let loading = $.state(true);

	let saving = $.state(false);
	let error = $.state(null);

	// Incident data
	let incident = $.state($.proxy({
		id: 0,
		title: "",
		start_date_time: Math.floor(Date.now() / 1000),
		status: "OPEN",
		state: GC.INVESTIGATING,
		is_global: "YES"
	}));

	// For datetime inputs (convert to/from local datetime string)
	let startDateTimeLocal = $.state("");

	// First comment for new incidents
	let firstComment = $.state("");

	// Comments for existing incidents
	let comments = $.state($.proxy([]));

	let loadingComments = $.state(false);

	// Monitors
	let availableMonitors = $.state($.proxy([]));

	let incidentMonitors = $.state($.proxy([]));
	let originalMonitors = $.state($.proxy([]));
	let addMonitorDialogOpen = $.state(false);
	let selectedMonitorTag = $.state("");
	let selectedMonitorImpact = $.state("DOWN");
	let addingMonitor = $.state(false);

	// Comment inline editing/adding
	let addingNewComment = $.state(false);

	let editingCommentId = $.state(null);
	let commentText = $.state("");
	let commentState = $.state($.proxy(GC.INVESTIGATING));
	let commentDateTime = $.state("");
	let savingComment = $.state(false);
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
	$.user_effect(() => {
		if ($.get(incident).start_date_time) {
			$.set(startDateTimeLocal, timestampToLocalDatetime($.get(incident).start_date_time), true);
		}
	});

	// Update incident timestamps when inputs change
	function handleStartDateChange(e) {
		const target = e.target;

		$.set(startDateTimeLocal, target.value, true);
		$.get(incident).start_date_time = localDatetimeToTimestamp(target.value);
	}

	// Validation
	const isValid = $.derived(() => $.get(incident).title.trim() !== "" && $.get(incident).start_date_time > 0);

	// Fetch incident data
	async function fetchIncident() {
		if ($.get(isNew)) {
			$.set(loading, false);

			return;
		}

		$.set(loading, true);
		$.set(error, null);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getIncident",
					data: { incident_id: parseInt($$props.params.incident_id) }
				})
			});

			const result = await response.json();

			if (result.error) {
				$.set(error, result.error, true);
			} else if (result) {
				$.set(
					incident,
					{
						id: result.id,
						title: result.title,
						start_date_time: result.start_date_time,
						status: result.status,
						state: result.state,
						is_global: result.is_global || "YES"
					},
					true
				);

				// Fetch comments and monitors
				await Promise.all([fetchComments(), fetchIncidentMonitors()]);
			} else {
				$.set(error, "Incident not found");
			}
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Failed to fetch incident", true);
		} finally {
			$.set(loading, false);
		}
	}

	// Fetch comments
	async function fetchComments() {
		if ($.get(isNew)) return;

		$.set(loadingComments, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getComments",
					data: { incident_id: parseInt($$props.params.incident_id) }
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(comments, result, true);
			}
		} catch {
			// Ignore errors
		} finally {
			$.set(loadingComments, false);
		}
	}

	// Fetch incident monitors
	async function fetchIncidentMonitors() {
		if ($.get(isNew)) return;

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
				const found = result.incidents.find((i) => i.id === parseInt($$props.params.incident_id));

				if (found && found.monitors) {
					$.set(
						incidentMonitors,
						found.monitors.map((m) => ({
							monitor_tag: m.tag || m.monitor_tag,
							monitor_impact: m.impact_type || m.monitor_impact
						})),
						true
					);

					// Store original monitors to compare on save
					$.set(originalMonitors, [...$.get(incidentMonitors)], true);
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
				$.set(availableMonitors, result, true);
			}
		} catch {
			// Ignore errors
		}
	}

	// Save incident (create or update)
	async function saveIncident() {
		if (!$.get(isValid)) return;

		$.set(saving, true);
		$.set(error, null);

		try {
			if ($.get(isNew)) {
				// Create new incident
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "createIncident",
						data: {
							title: $.get(incident).title,
							start_date_time: $.get(incident).start_date_time,
							end_date_time: null,
							status: "OPEN",
							state: GC.INVESTIGATING,
							incident_type: GC.INCIDENT,
							is_global: $.get(incident).is_global
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					const incidentId = result.incident_id;

					// Add monitors
					for (const monitor of $.get(incidentMonitors)) {
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
					if ($.get(firstComment).trim()) {
						await fetch(clientResolver(resolve, "/manage/api"), {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								action: "addComment",
								data: {
									incident_id: incidentId,
									comment: $.get(firstComment),
									state: GC.INVESTIGATING,
									commented_at: $.get(incident).start_date_time
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
							id: $.get(incident).id,
							title: $.get(incident).title,
							start_date_time: $.get(incident).start_date_time,
							end_date_time: null,
							status: "OPEN",
							is_global: $.get(incident).is_global
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					// Sync monitors - find added, removed, and changed
					const originalTags = $.get(originalMonitors).map((m) => m.monitor_tag);

					const currentTags = $.get(incidentMonitors).map((m) => m.monitor_tag);

					// Monitors to add (in current but not in original)
					const toAdd = $.get(incidentMonitors).filter((m) => !originalTags.includes(m.monitor_tag));

					// Monitors to remove (in original but not in current)
					const toRemove = $.get(originalMonitors).filter((m) => !currentTags.includes(m.monitor_tag));

					// Monitors with changed impact (in both but impact is different)
					const toUpdate = $.get(incidentMonitors).filter((m) => {
						const original = $.get(originalMonitors).find((o) => o.monitor_tag === m.monitor_tag);

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
									incident_id: $.get(incident).id,
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
									incident_id: $.get(incident).id,
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
								data: {
									incident_id: $.get(incident).id,
									monitor_tag: monitor.monitor_tag
								}
							})
						});
					}

					// Update originalMonitors to reflect current state
					$.set(originalMonitors, [...$.get(incidentMonitors)], true);

					toast.success("Changes saved successfully");
				}
			}
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			$.set(saving, false);
		}
	}

	// Add monitor to incident
	async function addMonitorToIncident() {
		if (!$.get(selectedMonitorTag) || !$.get(incident).id) return;

		$.set(addingMonitor, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "addMonitor",
					data: {
						incident_id: $.get(incident).id,
						monitor_tag: $.get(selectedMonitorTag),
						monitor_impact: $.get(selectedMonitorImpact)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitor added to incident");
				await fetchIncidentMonitors();
				$.set(addMonitorDialogOpen, false);
				$.set(selectedMonitorTag, "");
				$.set(selectedMonitorImpact, "DOWN");
			}
		} catch(e) {
			toast.error("Failed to add monitor");
		} finally {
			$.set(addingMonitor, false);
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
					data: { incident_id: $.get(incident).id, monitor_tag: monitorTag }
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
		$.set(editingCommentId, comment.id, true);
		$.set(commentText, comment.comment, true);
		$.set(commentState, comment.state, true);
		$.set(commentDateTime, timestampToLocalDatetime(comment.commented_at), true);
	}

	// Cancel editing
	function cancelEditComment() {
		$.set(editingCommentId, null);
		$.set(commentText, "");
		$.set(commentState, $.get(incident).state, true);
		$.set(commentDateTime, "");
	}

	// Start adding new comment (inline)
	function startAddComment() {
		$.set(addingNewComment, true);
		$.set(editingCommentId, null);
		$.set(commentText, "");
		$.set(commentState, $.get(incident).state, true);
		$.set(commentDateTime, timestampToLocalDatetime(Math.floor(Date.now() / 1000)), true);
	}

	// Cancel adding new comment
	function cancelAddComment() {
		$.set(addingNewComment, false);
		$.set(commentText, "");
		$.set(commentState, $.get(incident).state, true);
		$.set(commentDateTime, "");
	}

	// Save comment (add or edit)
	async function saveComment() {
		if (!$.get(commentText).trim()) return;

		$.set(savingComment, true);

		try {
			if ($.get(editingCommentId) !== null) {
				// Update existing comment
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateComment",
						data: {
							incident_id: $.get(incident).id,
							comment_id: $.get(editingCommentId),
							comment: $.get(commentText),
							state: $.get(commentState),
							commented_at: localDatetimeToTimestamp($.get(commentDateTime))
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
							incident_id: $.get(incident).id,
							comment: $.get(commentText),
							state: $.get(commentState),
							commented_at: localDatetimeToTimestamp($.get(commentDateTime))
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
			$.set(savingComment, false);
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
					data: { incident_id: $.get(incident).id, comment_id: commentId }
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
		if (!$.get(selectedMonitorTag)) return;

		$.set(
			incidentMonitors,
			[
				...$.get(incidentMonitors),
				{
					monitor_tag: $.get(selectedMonitorTag),
					monitor_impact: $.get(selectedMonitorImpact)
				}
			],
			true
		);

		$.set(addMonitorDialogOpen, false);
		$.set(selectedMonitorTag, "");
		$.set(selectedMonitorImpact, "DOWN");
	}

	// Remove monitor from list (for new incidents)
	function removeMonitorFromList(monitorTag) {
		$.set(incidentMonitors, $.get(incidentMonitors).filter((m) => m.monitor_tag !== monitorTag), true);
	}

	// Update monitor impact in list
	function updateMonitorImpact(monitorTag, newImpact) {
		$.set(incidentMonitors, $.get(incidentMonitors).map((m) => m.monitor_tag === monitorTag ? { ...m, monitor_impact: newImpact } : m), true);
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
		const monitor = $.get(availableMonitors).find((m) => m.tag === tag);

		return monitor?.name || tag;
	}

	// Get unassigned monitors
	const unassignedMonitors = $.derived(() => $.get(availableMonitors).filter((m) => !$.get(incidentMonitors).some((im) => im.monitor_tag === m.tag)));

	// Delete incident
	let deleteDialogOpen = $.state(false);

	let deleteConfirmText = $.state("");
	let deleting = $.state(false);
	const deleteConfirmPhrase = $.derived(() => `delete incident ${$$props.params.incident_id}`);
	const deleteConfirmed = $.derived(() => $.get(deleteConfirmText) === $.get(deleteConfirmPhrase));

	async function deleteIncident() {
		if (!$.get(deleteConfirmed)) return;

		$.set(deleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteIncident",
					data: { incident_id: parseInt($$props.params.incident_id) }
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
			$.set(deleting, false);
		}
	}

	$.user_effect(() => {
		fetchIncident();
		fetchAvailableMonitors();
	});

	var div = root_34();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_3 = $.first_child(fragment_2);

										{
											let $0 = $.derived(() => clientResolver(resolve, "/manage/app/incidents"));

											$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
												Breadcrumb_Link($$anchor, {
													get href() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Incidents');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(isNew)
														? "New Incident"
														: `Edit Incident #${$$props.params.incident_id}`));

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_2 = $.sibling(node, 2);
	var node_7 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_5 = root_2();
			var node_8 = $.first_child(fragment_5);

			{
				let $0 = $.derived(() => clientResolver(resolve, `/incidents/${$$props.params.incident_id}`));

				Button(node_8, {
					variant: 'outline',
					target: '_blank',
					size: 'sm',
					get href() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('View');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			var node_9 = $.sibling(node_8, 2);

			$.component(node_9, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					onOpenChange: () => $.set(deleteConfirmText, ""),
					get open() {
						return $.get(deleteDialogOpen);
					},

					set open($$value) {
						$.set(deleteDialogOpen, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_2();
						var node_10 = $.first_child(fragment_6);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(props, {
									variant: 'destructive',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_11 = $.first_child(fragment_8);

										TrashIcon(node_11, { class: 'size-4' });
										$.next();
										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_10, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_12 = $.sibling(node_10, 2);

						$.component(node_12, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_5();
									var node_13 = $.first_child(fragment_9);

									$.component(node_13, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_2();
												var node_14 = $.first_child(fragment_10);

												$.component(node_14, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Delete Incident');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('This action cannot be undone. This will permanently delete the incident, its updates, and remove all\n                associated monitor links.');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var div_3 = $.sibling(node_13, 2);
									var div_4 = $.child(div_3);
									var node_16 = $.child(div_4);

									Label(node_16, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_11 = root_3();
											var span = $.sibling($.first_child(fragment_11));
											var text_5 = $.only_child(span, true);

											$.next();
											$.template_effect(() => $.set_text(text_5, $.get(deleteConfirmPhrase)));
											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									var node_17 = $.sibling(node_16, 2);

									Input(node_17, {
										get placeholder() {
											return $.get(deleteConfirmPhrase);
										},

										get value() {
											return $.get(deleteConfirmText);
										},

										set value($$value) {
											$.set(deleteConfirmText, $$value, true);
										}
									});

									$.reset(div_4);
									$.reset(div_3);

									var node_18 = $.sibling(div_3, 2);

									$.component(node_18, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root_2();
												var node_19 = $.first_child(fragment_12);

												Button(node_19, {
													variant: 'outline',
													onclick: () => $.set(deleteDialogOpen, false),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('Cancel');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});

												var node_20 = $.sibling(node_19, 2);

												{
													let $0 = $.derived(() => !$.get(deleteConfirmed) || $.get(deleting));

													Button(node_20, {
														variant: 'destructive',
														onclick: deleteIncident,
														get disabled() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_4();
															var node_21 = $.first_child(fragment_13);

															{
																var consequent = ($$anchor) => {
																	Loader($$anchor, { class: 'size-4 animate-spin' });
																};

																$.if(node_21, ($$render) => {
																	if ($.get(deleting)) $$render(consequent);
																});
															}

															$.next();
															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												}

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
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
		};

		$.if(node_7, ($$render) => {
			if (!$.get(isNew)) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var node_22 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_5 = root_6();
			var node_23 = $.child(div_5);

			Spinner(node_23, { class: 'size-8' });
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_15 = $.comment();
			var node_24 = $.first_child(fragment_15);

			$.component(node_24, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'border-destructive',
					children: ($$anchor, $$slotProps) => {
						var fragment_16 = $.comment();
						var node_25 = $.first_child(fragment_16);

						$.component(node_25, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var div_6 = root_7();
									var node_26 = $.child(div_6);

									AlertTriangleIcon(node_26, { class: 'text-destructive size-5' });

									var p = $.sibling(node_26, 2);
									var text_7 = $.only_child(p, true);

									$.reset(div_6);
									$.template_effect(() => $.set_text(text_7, $.get(error)));
									$.append($$anchor, div_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_15);
		};

		var alternate_7 = ($$anchor) => {
			var fragment_17 = root_2();
			var node_27 = $.first_child(fragment_17);

			$.component(node_27, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_18 = root();
						var node_28 = $.first_child(fragment_18);

						$.component(node_28, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_2();
									var node_29 = $.first_child(fragment_19);

									$.component(node_29, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text();

												$.template_effect(() => $.set_text(text_8, $.get(isNew) ? "Create New Incident" : "Incident Details"));
												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_30 = $.sibling(node_29, 2);

									$.component(node_30, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = $.comment();
												var node_31 = $.first_child(fragment_21);

												{
													var consequent_4 = ($$anchor) => {
														var text_9 = $.text('Create a new incident to track');

														$.append($$anchor, text_9);
													};

													var alternate = ($$anchor) => {
														var text_10 = $.text('Edit incident details and manage updates');

														$.append($$anchor, text_10);
													};

													$.if(node_31, ($$render) => {
														if ($.get(isNew)) $$render(consequent_4); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						});

						var node_32 = $.sibling(node_28, 2);

						$.component(node_32, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_22 = root_22();
									var node_33 = $.first_child(fragment_22);

									{
										var consequent_5 = ($$anchor) => {
											var div_7 = root_8();
											var node_34 = $.child(div_7);

											{
												let $0 = $.derived(() => $.get(incident).state.toLowerCase());
												let $1 = $.derived(() => $.get(incident).state.toLowerCase());

												Badge(node_34, {
													variant: 'outline',
													get class() {
														return `text-${$.get($0) ?? ''} border-${$.get($1) ?? ''} font-semibold`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text();

														$.template_effect(() => $.set_text(text_11, $.get(incident).state));
														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_7);
											$.append($$anchor, div_7);
										};

										$.if(node_33, ($$render) => {
											if (!$.get(isNew)) $$render(consequent_5);
										});
									}

									var div_8 = $.sibling(node_33, 2);
									var node_35 = $.child(div_8);

									Label(node_35, {
										for: 'incident-title',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_24 = root_9();

											$.next();
											$.append($$anchor, fragment_24);
										},
										$$slots: { default: true }
									});

									var node_36 = $.sibling(node_35, 2);

									Input(node_36, {
										id: 'incident-title',
										placeholder: 'Brief description of the incident',
										get value() {
											return $.get(incident).title;
										},

										set value($$value) {
											$.get(incident).title = $$value;
										}
									});

									$.reset(div_8);

									var div_9 = $.sibling(div_8, 2);
									var node_37 = $.child(div_9);

									Label(node_37, {
										for: 'incident-start',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_25 = root_10();

											$.next();
											$.append($$anchor, fragment_25);
										},
										$$slots: { default: true }
									});

									var node_38 = $.sibling(node_37, 2);

									Input(node_38, {
										id: 'incident-start',
										type: 'datetime-local',
										get value() {
											return $.get(startDateTimeLocal);
										},
										onchange: handleStartDateChange
									});

									$.next(2);
									$.reset(div_9);

									var div_10 = $.sibling(div_9, 2);
									var div_11 = $.child(div_10);
									var node_39 = $.child(div_11);

									Label(node_39, {
										for: 'is-global',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Global Incident');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_11);

									var node_40 = $.sibling(div_11, 2);

									{
										let $0 = $.derived(() => $.get(incident).is_global === "YES");

										Switch(node_40, {
											id: 'is-global',
											get checked() {
												return $.get($0);
											},

											onCheckedChange: (checked) => {
												$.get(incident).is_global = checked ? "YES" : "NO";
											}
										});
									}

									$.reset(div_10);

									var node_41 = $.sibling(div_10, 2);

									{
										var consequent_6 = ($$anchor) => {
											var div_12 = root_11();
											var node_42 = $.child(div_12);

											Label(node_42, {
												for: 'first-comment',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Initial Update (Optional)');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});

											var div_13 = $.sibling(node_42, 2);
											var node_43 = $.child(div_13);

											{
												let $0 = $.derived(markdown);
												let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

												CodeMirror(node_43, {
													get lang() {
														return $.get($0);
													},

													get theme() {
														return $.get($1);
													},
													styles: { "&": { width: "100%", maxWidth: "100%", height: "160px" } },
													get value() {
														return $.get(firstComment);
													},

													set value($$value) {
														$.set(firstComment, $$value, true);
													}
												});
											}

											$.reset(div_13);
											$.next(2);
											$.reset(div_12);
											$.append($$anchor, div_12);
										};

										$.if(node_41, ($$render) => {
											if ($.get(isNew)) $$render(consequent_6);
										});
									}

									var div_14 = $.sibling(node_41, 2);
									var div_15 = $.child(div_14);
									var node_44 = $.child(div_15);

									Label(node_44, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('Affected Monitors (Optional)');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_45 = $.sibling(node_44, 2);

									$.component(node_45, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
										Dialog_Root_1($$anchor, {
											get open() {
												return $.get(addMonitorDialogOpen);
											},

											set open($$value) {
												$.set(addMonitorDialogOpen, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root_2();
												var node_46 = $.first_child(fragment_26);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														{
															let $0 = $.derived(() => $.get(unassignedMonitors).length === 0);

															Button($$anchor, $.spread_props(props, {
																size: 'sm',
																variant: 'outline',
																get disabled() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_28 = root_12();
																	var node_47 = $.first_child(fragment_28);

																	PlusIcon(node_47, { class: 'size-4' });
																	$.next();
																	$.append($$anchor, fragment_28);
																},
																$$slots: { default: true }
															}));
														}
													};

													$.component(node_46, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_1) => {
														Dialog_Trigger_1($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_48 = $.sibling(node_46, 2);

												$.component(node_48, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
													Dialog_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_29 = root_13();
															var node_49 = $.first_child(fragment_29);

															$.component(node_49, () => Dialog.Header, ($$anchor, Dialog_Header_1) => {
																Dialog_Header_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_30 = root_2();
																		var node_50 = $.first_child(fragment_30);

																		$.component(node_50, () => Dialog.Title, ($$anchor, Dialog_Title_1) => {
																			Dialog_Title_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_15 = $.text('Add Affected Monitor');

																					$.append($$anchor, text_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_51 = $.sibling(node_50, 2);

																		$.component(node_51, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
																			Dialog_Description_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_16 = $.text('Select a monitor and its impact level');

																					$.append($$anchor, text_16);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_30);
																	},
																	$$slots: { default: true }
																});
															});

															var div_16 = $.sibling(node_49, 2);
															var div_17 = $.child(div_16);
															var node_52 = $.child(div_17);

															Label(node_52, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('Monitor');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});

															var node_53 = $.sibling(node_52, 2);

															$.component(node_53, () => Select.Root, ($$anchor, Select_Root) => {
																Select_Root($$anchor, {
																	type: 'single',
																	get value() {
																		return $.get(selectedMonitorTag);
																	},

																	onValueChange: (v) => {
																		if (v) $.set(selectedMonitorTag, v, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_31 = root_2();
																		var node_54 = $.first_child(fragment_31);

																		$.component(node_54, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																			Select_Trigger($$anchor, {
																				class: 'w-full',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_18 = $.text();

																					$.template_effect(($0) => $.set_text(text_18, $0), [
																						() => $.get(selectedMonitorTag)
																							? getMonitorName($.get(selectedMonitorTag))
																							: "Select a monitor"
																					]);

																					$.append($$anchor, text_18);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_55 = $.sibling(node_54, 2);

																		$.component(node_55, () => Select.Content, ($$anchor, Select_Content) => {
																			Select_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_33 = $.comment();
																					var node_56 = $.first_child(fragment_33);

																					$.each(node_56, 17, () => $.get(unassignedMonitors), $.index, ($$anchor, monitor) => {
																						var fragment_34 = $.comment();
																						var node_57 = $.first_child(fragment_34);

																						$.component(node_57, () => Select.Item, ($$anchor, Select_Item) => {
																							Select_Item($$anchor, {
																								get value() {
																									return $.get(monitor).tag;
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_19 = $.text();

																									$.template_effect(() => $.set_text(text_19, $.get(monitor).name));
																									$.append($$anchor, text_19);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_34);
																					});

																					$.append($$anchor, fragment_33);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_31);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div_17);

															var div_18 = $.sibling(div_17, 2);
															var node_58 = $.child(div_18);

															Label(node_58, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_20 = $.text('Impact Level');

																	$.append($$anchor, text_20);
																},
																$$slots: { default: true }
															});

															var node_59 = $.sibling(node_58, 2);

															$.component(node_59, () => Select.Root, ($$anchor, Select_Root_1) => {
																Select_Root_1($$anchor, {
																	type: 'single',
																	get value() {
																		return $.get(selectedMonitorImpact);
																	},

																	onValueChange: (v) => {
																		if (v) $.set(selectedMonitorImpact, v, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_36 = root_2();
																		var node_60 = $.first_child(fragment_36);

																		$.component(node_60, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																			Select_Trigger_1($$anchor, {
																				class: 'w-full',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_21 = $.text();

																					$.template_effect(() => $.set_text(text_21, $.get(selectedMonitorImpact)));
																					$.append($$anchor, text_21);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_61 = $.sibling(node_60, 2);

																		$.component(node_61, () => Select.Content, ($$anchor, Select_Content_1) => {
																			Select_Content_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_38 = root_2();
																					var node_62 = $.first_child(fragment_38);

																					$.component(node_62, () => Select.Item, ($$anchor, Select_Item_1) => {
																						Select_Item_1($$anchor, {
																							value: 'DOWN',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_22 = $.text('Down');

																								$.append($$anchor, text_22);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_63 = $.sibling(node_62, 2);

																					$.component(node_63, () => Select.Item, ($$anchor, Select_Item_2) => {
																						Select_Item_2($$anchor, {
																							value: 'DEGRADED',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_23 = $.text('Degraded');

																								$.append($$anchor, text_23);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_38);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_36);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div_18);
															$.reset(div_16);

															var node_64 = $.sibling(div_16, 2);

															$.component(node_64, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
																Dialog_Footer_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_39 = root_2();
																		var node_65 = $.first_child(fragment_39);

																		Button(node_65, {
																			variant: 'outline',
																			onclick: () => $.set(addMonitorDialogOpen, false),
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_24 = $.text('Cancel');

																				$.append($$anchor, text_24);
																			},
																			$$slots: { default: true }
																		});

																		var node_66 = $.sibling(node_65, 2);

																		{
																			let $0 = $.derived(() => !$.get(selectedMonitorTag));

																			Button(node_66, {
																				onclick: addMonitorToList,
																				get disabled() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_25 = $.text('Add Monitor');

																					$.append($$anchor, text_25);
																				},
																				$$slots: { default: true }
																			});
																		}

																		$.append($$anchor, fragment_39);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_29);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_26);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_15);

									var node_67 = $.sibling(div_15, 2);

									{
										var consequent_7 = ($$anchor) => {
											var p_1 = root_14();

											$.append($$anchor, p_1);
										};

										var alternate_3 = ($$anchor) => {
											var div_19 = root_21();

											$.each(div_19, 21, () => $.get(incidentMonitors), $.index, ($$anchor, monitor) => {
												var div_20 = root_20();
												var div_21 = $.child(div_20);
												var span_1 = $.child(div_21);
												var text_26 = $.only_child(span_1, true);
												var node_68 = $.sibling(span_1, 2);

												{
													let $0 = $.derived(() => $.get(monitor).monitor_impact?.toLowerCase() || 'default');
													let $1 = $.derived(() => $.get(monitor).monitor_impact?.toLowerCase() || 'default');

													Badge(node_68, {
														variant: 'outline',
														get class() {
															return `text-${$.get($0) ?? ''} font-semibold border-${$.get($1) ?? ''}`;
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_27 = $.text();

															$.template_effect(() => $.set_text(text_27, $.get(monitor).monitor_impact || "Unknown"));
															$.append($$anchor, text_27);
														},
														$$slots: { default: true }
													});
												}

												$.reset(div_21);

												var node_69 = $.sibling(div_21, 2);

												$.component(node_69, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
													DropdownMenu_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_41 = root_2();
															var node_70 = $.first_child(fragment_41);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	Button($$anchor, $.spread_props(props, {
																		variant: 'ghost',
																		size: 'icon',
																		children: ($$anchor, $$slotProps) => {
																			MoreVerticalIcon($$anchor, { class: 'size-4' });
																		},
																		$$slots: { default: true }
																	}));
																};

																$.component(node_70, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																	DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_71 = $.sibling(node_70, 2);

															$.component(node_71, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																DropdownMenu_Content($$anchor, {
																	align: 'end',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_44 = root_19();
																		var node_72 = $.first_child(fragment_44);

																		$.component(node_72, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																			DropdownMenu_Label($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_28 = $.text('Update Impact');

																					$.append($$anchor, text_28);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_73 = $.sibling(node_72, 2);

																		$.component(node_73, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																			DropdownMenu_Group($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_45 = root_2();
																					var node_74 = $.first_child(fragment_45);

																					$.component(node_74, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																						DropdownMenu_Item($$anchor, {
																							class: 'cursor-pointer',
																							onclick: () => updateMonitorImpact($.get(monitor).monitor_tag, "DOWN"),
																							children: ($$anchor, $$slotProps) => {
																								var span_2 = root_16();
																								var node_75 = $.child(span_2);

																								{
																									var consequent_8 = ($$anchor) => {
																										CheckIcon($$anchor, { class: 'size-4' });
																									};

																									var alternate_1 = ($$anchor) => {
																										var span_3 = root_15();

																										$.append($$anchor, span_3);
																									};

																									$.if(node_75, ($$render) => {
																										if ($.get(monitor).monitor_impact === "DOWN") $$render(consequent_8); else $$render(alternate_1, -1);
																									});
																								}

																								$.next();
																								$.reset(span_2);
																								$.append($$anchor, span_2);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_76 = $.sibling(node_74, 2);

																					$.component(node_76, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																						DropdownMenu_Item_1($$anchor, {
																							class: 'cursor-pointer',
																							onclick: () => updateMonitorImpact($.get(monitor).monitor_tag, "DEGRADED"),
																							children: ($$anchor, $$slotProps) => {
																								var span_4 = root_17();
																								var node_77 = $.child(span_4);

																								{
																									var consequent_9 = ($$anchor) => {
																										CheckIcon($$anchor, { class: 'size-4' });
																									};

																									var alternate_2 = ($$anchor) => {
																										var span_5 = root_15();

																										$.append($$anchor, span_5);
																									};

																									$.if(node_77, ($$render) => {
																										if ($.get(monitor).monitor_impact === "DEGRADED") $$render(consequent_9); else $$render(alternate_2, -1);
																									});
																								}

																								$.next();
																								$.reset(span_4);
																								$.append($$anchor, span_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_45);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_78 = $.sibling(node_73, 2);

																		$.component(node_78, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																			DropdownMenu_Separator($$anchor, {});
																		});

																		var node_79 = $.sibling(node_78, 2);

																		$.component(node_79, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				class: 'text-destructive cursor-pointer',
																				onclick: () => removeMonitorFromList($.get(monitor).monitor_tag),
																				children: ($$anchor, $$slotProps) => {
																					var fragment_48 = root_18();
																					var node_80 = $.first_child(fragment_48);

																					TrashIcon(node_80, { class: 'size-4' });
																					$.next();
																					$.append($$anchor, fragment_48);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_44);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_41);
														},
														$$slots: { default: true }
													});
												});

												$.reset(div_20);
												$.template_effect(($0) => $.set_text(text_26, $0), [() => getMonitorName($.get(monitor).monitor_tag)]);
												$.append($$anchor, div_20);
											});

											$.reset(div_19);
											$.append($$anchor, div_19);
										};

										$.if(node_67, ($$render) => {
											if ($.get(incidentMonitors).length === 0) $$render(consequent_7); else $$render(alternate_3, -1);
										});
									}

									$.reset(div_14);
									$.append($$anchor, fragment_22);
								},
								$$slots: { default: true }
							});
						});

						var node_81 = $.sibling(node_32, 2);

						$.component(node_81, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(saving) || !$.get(isValid));

										Button($$anchor, {
											onclick: saveIncident,
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_50 = root_23();
												var node_82 = $.first_child(fragment_50);

												{
													var consequent_10 = ($$anchor) => {
														Loader($$anchor, { class: 'size-4 animate-spin' });
													};

													var alternate_4 = ($$anchor) => {
														SaveIcon($$anchor, { class: 'size-4' });
													};

													$.if(node_82, ($$render) => {
														if ($.get(saving)) $$render(consequent_10); else $$render(alternate_4, -1);
													});
												}

												var text_29 = $.sibling(node_82);

												$.template_effect(() => $.set_text(text_29, ` ${$.get(isNew) ? "Create Incident" : "Save Changes"}`));
												$.append($$anchor, fragment_50);
											},
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_18);
					},
					$$slots: { default: true }
				});
			});

			var node_83 = $.sibling(node_27, 2);

			{
				var consequent_18 = ($$anchor) => {
					var fragment_53 = $.comment();
					var node_84 = $.first_child(fragment_53);

					$.component(node_84, () => Card.Root, ($$anchor, Card_Root_2) => {
						Card_Root_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_54 = root_2();
								var node_85 = $.first_child(fragment_54);

								$.component(node_85, () => Card.Header, ($$anchor, Card_Header_1) => {
									Card_Header_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div_22 = root_25();
											var div_23 = $.child(div_22);
											var node_86 = $.child(div_23);

											$.component(node_86, () => Card.Title, ($$anchor, Card_Title_1) => {
												Card_Title_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_30 = $.text('Updates');

														$.append($$anchor, text_30);
													},
													$$slots: { default: true }
												});
											});

											var node_87 = $.sibling(node_86, 2);

											$.component(node_87, () => Card.Description, ($$anchor, Card_Description_1) => {
												Card_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_31 = $.text('Timeline of status updates for this incident');

														$.append($$anchor, text_31);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_23);

											var node_88 = $.sibling(div_23, 2);

											{
												var consequent_11 = ($$anchor) => {
													Button($$anchor, {
														size: 'sm',
														onclick: startAddComment,
														children: ($$anchor, $$slotProps) => {
															var fragment_56 = root_24();
															var node_89 = $.first_child(fragment_56);

															PlusIcon(node_89, { class: 'size-4' });
															$.next();
															$.append($$anchor, fragment_56);
														},
														$$slots: { default: true }
													});
												};

												$.if(node_88, ($$render) => {
													if (!$.get(addingNewComment)) $$render(consequent_11);
												});
											}

											$.reset(div_22);
											$.append($$anchor, div_22);
										},
										$$slots: { default: true }
									});
								});

								var node_90 = $.sibling(node_85, 2);

								$.component(node_90, () => Card.Content, ($$anchor, Card_Content_2) => {
									Card_Content_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_57 = root_2();
											var node_91 = $.first_child(fragment_57);

											{
												var consequent_13 = ($$anchor) => {
													var div_24 = root_26();
													var div_25 = $.child(div_24);
													var node_92 = $.child(div_25);

													Label(node_92, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_32 = $.text('Update Message');

															$.append($$anchor, text_32);
														},
														$$slots: { default: true }
													});

													var div_26 = $.sibling(node_92, 2);
													var node_93 = $.child(div_26);

													{
														let $0 = $.derived(markdown);
														let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

														CodeMirror(node_93, {
															get lang() {
																return $.get($0);
															},

															get theme() {
																return $.get($1);
															},
															styles: { "&": { width: "100%", maxWidth: "100%", height: "120px" } },
															get value() {
																return $.get(commentText);
															},

															set value($$value) {
																$.set(commentText, $$value, true);
															}
														});
													}

													$.reset(div_26);
													$.next(2);
													$.reset(div_25);

													var div_27 = $.sibling(div_25, 2);
													var div_28 = $.child(div_27);
													var node_94 = $.child(div_28);

													Label(node_94, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_33 = $.text('State');

															$.append($$anchor, text_33);
														},
														$$slots: { default: true }
													});

													var node_95 = $.sibling(node_94, 2);

													$.component(node_95, () => Select.Root, ($$anchor, Select_Root_2) => {
														Select_Root_2($$anchor, {
															type: 'single',
															get value() {
																return $.get(commentState);
															},

															onValueChange: (v) => {
																if (v) $.set(commentState, v, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_58 = root_2();
																var node_96 = $.first_child(fragment_58);

																$.component(node_96, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
																	Select_Trigger_2($$anchor, {
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_34 = $.text();

																			$.template_effect(() => $.set_text(text_34, $.get(commentState)));
																			$.append($$anchor, text_34);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_97 = $.sibling(node_96, 2);

																$.component(node_97, () => Select.Content, ($$anchor, Select_Content_2) => {
																	Select_Content_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_60 = $.comment();
																			var node_98 = $.first_child(fragment_60);

																			$.each(node_98, 17, () => states, $.index, ($$anchor, state) => {
																				var fragment_61 = $.comment();
																				var node_99 = $.first_child(fragment_61);

																				$.component(node_99, () => Select.Item, ($$anchor, Select_Item_3) => {
																					Select_Item_3($$anchor, {
																						get value() {
																							return $.get(state);
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_35 = $.text();

																							$.template_effect(() => $.set_text(text_35, $.get(state)));
																							$.append($$anchor, text_35);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_61);
																			});

																			$.append($$anchor, fragment_60);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_58);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_28);

													var div_29 = $.sibling(div_28, 2);
													var node_100 = $.child(div_29);

													Label(node_100, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_36 = $.text('Date/Time');

															$.append($$anchor, text_36);
														},
														$$slots: { default: true }
													});

													var node_101 = $.sibling(node_100, 2);

													Input(node_101, {
														type: 'datetime-local',
														get value() {
															return $.get(commentDateTime);
														},

														set value($$value) {
															$.set(commentDateTime, $$value, true);
														}
													});

													$.reset(div_29);
													$.reset(div_27);

													var div_30 = $.sibling(div_27, 2);
													var node_102 = $.child(div_30);

													Button(node_102, {
														variant: 'outline',
														size: 'sm',
														onclick: cancelAddComment,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_37 = $.text('Cancel');

															$.append($$anchor, text_37);
														},
														$$slots: { default: true }
													});

													var node_103 = $.sibling(node_102, 2);

													{
														let $0 = $.derived(() => !$.get(commentText).trim() || $.get(savingComment));

														Button(node_103, {
															size: 'sm',
															onclick: saveComment,
															get disabled() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_63 = root_24();
																var node_104 = $.first_child(fragment_63);

																{
																	var consequent_12 = ($$anchor) => {
																		Loader($$anchor, { class: 'size-4 animate-spin' });
																	};

																	$.if(node_104, ($$render) => {
																		if ($.get(savingComment)) $$render(consequent_12);
																	});
																}

																$.next();
																$.append($$anchor, fragment_63);
															},
															$$slots: { default: true }
														});
													}

													$.reset(div_30);
													$.reset(div_24);
													$.append($$anchor, div_24);
												};

												$.if(node_91, ($$render) => {
													if ($.get(addingNewComment)) $$render(consequent_13);
												});
											}

											var node_105 = $.sibling(node_91, 2);

											{
												var consequent_14 = ($$anchor) => {
													var div_31 = root_27();
													var node_106 = $.child(div_31);

													Spinner(node_106, { class: 'size-6' });
													$.reset(div_31);
													$.append($$anchor, div_31);
												};

												var consequent_15 = ($$anchor) => {
													var p_2 = root_28();

													$.append($$anchor, p_2);
												};

												var alternate_6 = ($$anchor) => {
													var div_32 = root_33();

													$.each(div_32, 21, () => $.get(comments), (comment) => comment.id, ($$anchor, comment) => {
														var div_33 = root_32();
														var node_107 = $.child(div_33);

														{
															var consequent_17 = ($$anchor) => {
																var div_34 = root_30();
																var div_35 = $.child(div_34);
																var node_108 = $.child(div_35);

																Label(node_108, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_38 = $.text('Update Message');

																		$.append($$anchor, text_38);
																	},
																	$$slots: { default: true }
																});

																var div_36 = $.sibling(node_108, 2);
																var node_109 = $.child(div_36);

																{
																	let $0 = $.derived(markdown);
																	let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

																	CodeMirror(node_109, {
																		get lang() {
																			return $.get($0);
																		},

																		get theme() {
																			return $.get($1);
																		},
																		styles: { "&": { width: "100%", maxWidth: "100%", height: "120px" } },
																		get value() {
																			return $.get(commentText);
																		},

																		set value($$value) {
																			$.set(commentText, $$value, true);
																		}
																	});
																}

																$.reset(div_36);
																$.next(2);
																$.reset(div_35);

																var div_37 = $.sibling(div_35, 2);
																var div_38 = $.child(div_37);
																var node_110 = $.child(div_38);

																Label(node_110, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_39 = $.text('State');

																		$.append($$anchor, text_39);
																	},
																	$$slots: { default: true }
																});

																var node_111 = $.sibling(node_110, 2);

																$.component(node_111, () => Select.Root, ($$anchor, Select_Root_3) => {
																	Select_Root_3($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(commentState);
																		},

																		onValueChange: (v) => {
																			if (v) $.set(commentState, v, true);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_65 = root_2();
																			var node_112 = $.first_child(fragment_65);

																			$.component(node_112, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
																				Select_Trigger_3($$anchor, {
																					class: 'w-full',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_40 = $.text();

																						$.template_effect(() => $.set_text(text_40, $.get(commentState)));
																						$.append($$anchor, text_40);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_113 = $.sibling(node_112, 2);

																			$.component(node_113, () => Select.Content, ($$anchor, Select_Content_3) => {
																				Select_Content_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_67 = $.comment();
																						var node_114 = $.first_child(fragment_67);

																						$.each(node_114, 17, () => states, $.index, ($$anchor, state) => {
																							var fragment_68 = $.comment();
																							var node_115 = $.first_child(fragment_68);

																							$.component(node_115, () => Select.Item, ($$anchor, Select_Item_4) => {
																								Select_Item_4($$anchor, {
																									get value() {
																										return $.get(state);
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_41 = $.text();

																										$.template_effect(() => $.set_text(text_41, $.get(state)));
																										$.append($$anchor, text_41);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_68);
																						});

																						$.append($$anchor, fragment_67);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_65);
																		},
																		$$slots: { default: true }
																	});
																});

																$.reset(div_38);

																var div_39 = $.sibling(div_38, 2);
																var node_116 = $.child(div_39);

																Label(node_116, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_42 = $.text('Date/Time');

																		$.append($$anchor, text_42);
																	},
																	$$slots: { default: true }
																});

																var node_117 = $.sibling(node_116, 2);

																Input(node_117, {
																	type: 'datetime-local',
																	get value() {
																		return $.get(commentDateTime);
																	},

																	set value($$value) {
																		$.set(commentDateTime, $$value, true);
																	}
																});

																$.reset(div_39);
																$.reset(div_37);

																var div_40 = $.sibling(div_37, 2);
																var node_118 = $.child(div_40);

																Button(node_118, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: cancelEditComment,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_43 = $.text('Cancel');

																		$.append($$anchor, text_43);
																	},
																	$$slots: { default: true }
																});

																var node_119 = $.sibling(node_118, 2);

																{
																	let $0 = $.derived(() => !$.get(commentText).trim() || $.get(savingComment));

																	Button(node_119, {
																		size: 'sm',
																		onclick: saveComment,
																		get disabled() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_70 = root_29();
																			var node_120 = $.first_child(fragment_70);

																			{
																				var consequent_16 = ($$anchor) => {
																					Loader($$anchor, { class: 'size-4 animate-spin' });
																				};

																				$.if(node_120, ($$render) => {
																					if ($.get(savingComment)) $$render(consequent_16);
																				});
																			}

																			$.next();
																			$.append($$anchor, fragment_70);
																		},
																		$$slots: { default: true }
																	});
																}

																$.reset(div_40);
																$.reset(div_34);
																$.append($$anchor, div_34);
															};

															var alternate_5 = ($$anchor) => {
																var div_41 = root_31();
																var div_42 = $.child(div_41);
																var div_43 = $.child(div_42);
																var node_121 = $.child(div_43);

																{
																	let $0 = $.derived(() => getStateBadgeVariant($.get(comment).state));

																	Badge(node_121, {
																		get variant() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_44 = $.text();

																			$.template_effect(() => $.set_text(text_44, $.get(comment).state));
																			$.append($$anchor, text_44);
																		},
																		$$slots: { default: true }
																	});
																}

																var span_6 = $.sibling(node_121, 2);
																var text_45 = $.only_child(span_6, true);

																$.reset(div_43);

																var div_44 = $.sibling(div_43, 2);
																var node_122 = $.child(div_44);

																{
																	let $0 = $.derived(() => mdToHTML($.get(comment).comment));

																	SveltePurify(node_122, {
																		get html() {
																			return $.get($0);
																		}
																	});
																}

																$.reset(div_44);
																$.reset(div_42);

																var div_45 = $.sibling(div_42, 2);
																var node_123 = $.child(div_45);

																Button(node_123, {
																	variant: 'ghost',
																	size: 'icon',
																	onclick: () => startEditComment($.get(comment)),
																	children: ($$anchor, $$slotProps) => {
																		PencilIcon($$anchor, { class: 'size-4' });
																	},
																	$$slots: { default: true }
																});

																var node_124 = $.sibling(node_123, 2);

																Button(node_124, {
																	variant: 'ghost',
																	size: 'icon',
																	onclick: () => deleteComment($.get(comment).id),
																	children: ($$anchor, $$slotProps) => {
																		TrashIcon($$anchor, { class: 'size-4' });
																	},
																	$$slots: { default: true }
																});

																$.reset(div_45);
																$.reset(div_41);

																$.template_effect(($0) => $.set_text(text_45, $0), [
																	() => format(new Date($.get(comment).commented_at * 1000), "MMM d, yyyy HH:mm")
																]);

																$.append($$anchor, div_41);
															};

															$.if(node_107, ($$render) => {
																if ($.get(editingCommentId) === $.get(comment).id) $$render(consequent_17); else $$render(alternate_5, -1);
															});
														}

														$.reset(div_33);
														$.append($$anchor, div_33);
													});

													$.reset(div_32);
													$.append($$anchor, div_32);
												};

												$.if(node_105, ($$render) => {
													if ($.get(loadingComments)) $$render(consequent_14); else if ($.get(comments).length === 0 && !$.get(addingNewComment)) $$render(consequent_15, 1); else $$render(alternate_6, -1);
												});
											}

											$.append($$anchor, fragment_57);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_54);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_53);
				};

				$.if(node_83, ($$render) => {
					if (!$.get(isNew)) $$render(consequent_18);
				});
			}

			$.append($$anchor, fragment_17);
		};

		$.if(node_22, ($$render) => {
			if ($.get(loading)) $$render(consequent_2); else if ($.get(error)) $$render(consequent_3, 1); else $$render(alternate_7, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}