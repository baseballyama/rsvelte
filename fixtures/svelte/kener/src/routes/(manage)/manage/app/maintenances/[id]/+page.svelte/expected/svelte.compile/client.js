import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import TrashIcon from "@lucide/svelte/icons/trash";
import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import RepeatIcon from "@lucide/svelte/icons/repeat";
import InfoIcon from "@lucide/svelte/icons/info";
import ClockIcon from "@lucide/svelte/icons/clock";
import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
import PlayCircleIcon from "@lucide/svelte/icons/play-circle";
import XCircleIcon from "@lucide/svelte/icons/x-circle";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";

import {
	format,
	formatDistanceToNow,
	isPast,
	isFuture,
	isWithinInterval
} from "date-fns";

import { rrulestr } from "rrule";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> <p class="text-destructive"> </p></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`Schedule Type <span class="text-destructive">*</span>`, 1);
var root_5 = $.from_html(`<!> One-Time`, 1);
var root_6 = $.from_html(`<!> Recurring`, 1);
var root_7 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div>`, 1);
var root_8 = $.from_html(`Title <span class="text-destructive">*</span>`, 1);
var root_9 = $.from_html(` <span class="text-destructive">*</span>`, 1);
var root_10 = $.from_html(`<p class="text-muted-foreground text-xs">Recurring maintenances will occur at this same time of day. The date pattern is configured below.</p>`);
var root_11 = $.from_html(`Duration <span class="text-destructive">*</span>`, 1);
var root_12 = $.from_html(`<!> `, 1);
var root_13 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">One-time maintenance uses a fixed RRULE that triggers only once.</p></div>`);
var root_14 = $.from_html(`iCalendar RRULE <span class="text-destructive">*</span>`, 1);
var root_15 = $.from_html(`<p class="text-destructive text-xs"> </p>`);
var root_16 = $.from_html(`<div class="flex flex-col gap-2"><!> <div class="flex flex-wrap gap-2"></div></div>`);
var root_17 = $.from_html(`<li class="flex items-center gap-2"><!> </li>`);
var root_18 = $.from_html(`<div class="bg-background rounded-md border p-3"><!> <ul class="mt-2 space-y-1 text-sm"></ul></div>`);
var root_19 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <!></div> <!> <!>`, 1);
var root_20 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_21 = $.from_html(`<p class="text-muted-foreground col-span-2 text-sm">No monitors available</p>`);
var root_22 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_23 = $.from_html(`<div class="bg-muted/30 flex items-center justify-between gap-3 rounded border p-2"><span class="text-sm font-medium"> </span> <!></div>`);
var root_24 = $.from_html(`<div class="rounded-md border p-3"><!> <div class="space-y-2"></div></div>`);
var root_25 = $.from_html(`<div class="flex flex-col gap-2"><!> <div class="flex gap-2"><!> <!></div></div>`);
var root_26 = $.from_html(`<div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col gap-1"><!> <p class="text-muted-foreground text-xs">When enabled, this maintenance will be visible on all status pages</p></div> <!></div> <div class="flex flex-col gap-2"><!> <!> <!></div> <div class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><div class="flex items-center gap-1"><!> <span class="text-muted-foreground text-sm">hours</span></div> <div class="flex items-center gap-1"><!> <span class="text-muted-foreground text-sm">minutes</span></div></div> <p class="text-muted-foreground text-xs"> </p></div> <!> <div class="flex flex-col gap-3"><!> <div class="rounded-md border p-3"><!> <div class="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto"><!> <!></div></div> <!> <p class="text-muted-foreground text-xs">Select monitors and set their status during the maintenance window</p></div> <!>`, 1);
var root_27 = $.from_html(`<!> Delete`, 1);
var root_28 = $.from_html(`<div><!> <!></div>`);
var root_29 = $.from_html(`<div class="flex justify-center py-4"><!></div>`);
var root_30 = $.from_html(`<p class="text-muted-foreground py-4 text-center text-sm">No events scheduled. Events are generated automatically when maintenance is created or updated.</p>`);
var root_31 = $.from_html(`<!> Complete`, 1);
var root_32 = $.from_html(`<!> Cancel`, 1);
var root_33 = $.from_html(`<div class="flex items-center justify-between rounded-md border p-4"><div class="flex items-center gap-3"><div class="bg-muted flex size-8 items-center justify-center rounded-full"><!></div> <div class="space-y-1"><div class="flex items-center gap-2"><!></div> <p class="text-muted-foreground text-sm"> </p></div></div> <div class="flex items-center gap-2"><!> <!> <!></div></div>`);
var root_34 = $.from_html(`<div class="space-y-3"></div>`);
var root_35 = $.from_html(`<div class="container space-y-6 py-6"><div class="flex justify-between gap-2"><!> <div><!></div></div> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const isNew = $.derived(() => $$props.params.id === "new");

	// Types
	// Form state
	let loading = $.state(true);

	let saving = $.state(false);
	let error = $.state(null);

	// Schedule type for UI switching
	let scheduleType = $.state("ONE_TIME");

	// Maintenance data
	let maintenance = $.state($.proxy({
		id: 0,
		title: "",
		description: "",
		start_date_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
		rrule: "FREQ=MINUTELY;COUNT=1",
		duration_seconds: 3600, // 1 hour default
		status: "ACTIVE",
		is_global: "YES"
	}));

	// For datetime input
	let startDateTimeLocal = $.state("");

	// Duration inputs (for easier UI)
	let durationHours = $.state(1);

	let durationMinutes = $.state(0);

	// Custom RRULE input for recurring
	let customRrule = $.state("FREQ=WEEKLY;BYDAY=SU");

	// Sample RRULE patterns
	const sampleRrules = [
		{ label: "Every Sunday", value: "FREQ=WEEKLY;BYDAY=SU" },
		{ label: "Every Day", value: "FREQ=DAILY" },
		{ label: "Weekdays", value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" },
		{ label: "Every Monday", value: "FREQ=WEEKLY;BYDAY=MO" },
		{
			label: "Bi-weekly Monday",
			value: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO"
		},
		{ label: "First of Month", value: "FREQ=MONTHLY;BYMONTHDAY=1" }
	];

	// Monitor selection
	let availableMonitors = $.state($.proxy([]));

	let selectedMonitors = $.state($.proxy([]));

	// Derived for backward compatibility
	const selectedMonitorTags = $.derived(() => $.get(selectedMonitors).map((m) => m.tag));

	// Events for existing maintenance
	let events = $.state($.proxy([]));

	let loadingEvents = $.state(false);

	// Event status confirmation dialog
	let eventStatusDialogOpen = $.state(false);

	let updatingEventStatus = $.state(false);
	let pendingEventStatusUpdate = $.state(null);

	function openEventStatusDialog(eventId, status) {
		$.set(pendingEventStatusUpdate, { eventId, status }, true);
		$.set(eventStatusDialogOpen, true);
	}

	function closeEventStatusDialog() {
		$.set(eventStatusDialogOpen, false);
		$.set(pendingEventStatusUpdate, null);
	}

	const eventStatusDialogCopy = $.derived(() => {
		if ($.get(pendingEventStatusUpdate)?.status === "COMPLETED") {
			return {
				title: "Complete Maintenance Event",
				description: "This will mark the event as completed and set its end time to the current time.",
				confirmLabel: "Complete Event",
				cancelLabel: "Keep Ongoing",
				confirmVariant: "default"
			};
		}

		return {
			title: "Cancel Maintenance Event",
			description: "This will mark the event as cancelled and remove it from active scheduling.",
			confirmLabel: "Cancel Event",
			cancelLabel: "Keep Scheduled",
			confirmVariant: "destructive"
		};
	});

	// Convert timestamp to local datetime string for input
	function timestampToLocalDatetime(ts) {
		const date = new Date(ts * 1000);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	// Convert local datetime string to timestamp
	function localDatetimeToTimestamp(datetime) {
		if (!datetime) return Math.floor(Date.now() / 1000);

		const date = new Date(datetime);

		return Math.floor(date.getTime() / 1000);
	}

	// Get the RRULE to use
	function getRrule() {
		if ($.get(scheduleType) === "ONE_TIME") {
			return "FREQ=MINUTELY;COUNT=1";
		}

		return $.get(customRrule);
	}

	// Parse RRULE string for UI
	function parseRrule(rrule) {
		if (rrule.includes("COUNT=1")) {
			$.set(scheduleType, "ONE_TIME");
		} else {
			$.set(scheduleType, "RECURRING");
			$.set(customRrule, rrule, true);
		}
	}

	// Generate preview dates based on RRULE and start time
	function getPreviewDates() {
		if ($.get(scheduleType) === "ONE_TIME" || !$.get(startDateTimeLocal) || !$.get(customRrule).trim()) {
			return [];
		}

		try {
			const dtstart = new Date($.get(startDateTimeLocal));
			const fullRrule = `DTSTART:${dtstart.toISOString().replace(/[-:]/g, "").split(".")[0]}Z\nRRULE:${$.get(customRrule)}`;
			const rule = rrulestr(fullRrule);
			const occurrences = [];
			let searchFrom = new Date();

			for (let i = 0; i < 5; i++) {
				const next = rule.after(searchFrom, i === 0);

				if (!next) break;

				occurrences.push(next);
				searchFrom = next;
			}

			return occurrences.map((d) => format(d, "EEE, MMM d, yyyy 'at' h:mm a"));
		} catch(e) {
			return [];
		}
	}

	// Validate RRULE format
	function validateRrule() {
		if ($.get(scheduleType) === "ONE_TIME" || !$.get(customRrule).trim()) {
			return null;
		}

		try {
			const dtstart = new Date();
			const fullRrule = `DTSTART:${dtstart.toISOString().replace(/[-:]/g, "").split(".")[0]}Z\nRRULE:${$.get(customRrule)}`;

			rrulestr(fullRrule);

			return null;
		} catch(e) {
			return "Invalid RRULE format";
		}
	}

	// Reactive preview dates
	const previewDates = $.derived(() => getPreviewDates());

	// Reactive RRULE error
	const rruleError = $.derived(() => validateRrule());

	// Calculate duration_seconds from hours and minutes
	const calculatedDurationSeconds = $.derived(() => $.get(durationHours) * 3600 + $.get(durationMinutes) * 60);

	// Update duration inputs when duration_seconds changes
	function updateDurationInputs(seconds) {
		$.set(durationHours, Math.floor(seconds / 3600), true);
		$.set(durationMinutes, Math.floor(seconds % 3600 / 60), true);
	}

	// Validation
	const isValid = $.derived(() => {
		if (!$.get(maintenance).title.trim()) return false;
		if (!$.get(startDateTimeLocal)) return false;
		if ($.get(calculatedDurationSeconds) <= 0) return false;
		if ($.get(scheduleType) === "RECURRING" && (!$.get(customRrule).trim() || $.get(rruleError))) return false;

		return true;
	});

	// Fetch maintenance data
	async function fetchMaintenance() {
		if ($.get(isNew)) {
			// Set default start time (1 hour from now)
			$.set(startDateTimeLocal, timestampToLocalDatetime(Math.floor(Date.now() / 1000) + 3600), true);

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
					action: "getMaintenance",
					data: { id: parseInt($$props.params.id) }
				})
			});

			const result = await response.json();

			if (result.error) {
				$.set(error, result.error, true);
			} else if (result) {
				$.set(
					maintenance,
					{
						id: result.id,
						title: result.title,
						description: result.description || "",
						start_date_time: result.start_date_time,
						rrule: result.rrule,
						duration_seconds: result.duration_seconds,
						status: result.status,
						is_global: result.is_global || "YES"
					},
					true
				);

				// Parse RRULE for UI
				parseRrule(result.rrule);

				// Set UI values
				$.set(startDateTimeLocal, timestampToLocalDatetime(result.start_date_time), true);

				updateDurationInputs(result.duration_seconds);

				// Set monitors with their statuses
				if (result.monitors) {
					$.set(
						selectedMonitors,
						result.monitors.map((m) => ({
							tag: m.monitor_tag,
							status: m.monitor_impact || "MAINTENANCE"
						})),
						true
					);
				}

				$.set(events, result.events || [], true);
			} else {
				$.set(error, "Maintenance not found");
			}
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Failed to fetch maintenance", true);
		} finally {
			$.set(loading, false);
		}
	}

	// Fetch events
	async function fetchEvents() {
		$.set(loadingEvents, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getMaintenanceEvents",
					data: { maintenance_id: parseInt($$props.params.id) }
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(events, result, true);
			}
		} catch {
			// Ignore errors
		} finally {
			$.set(loadingEvents, false);
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

	// Save maintenance
	async function saveMaintenance() {
		if (!$.get(isValid)) return;

		$.set(saving, true);
		$.set(error, null);

		try {
			const rrule = getRrule();
			const startTime = localDatetimeToTimestamp($.get(startDateTimeLocal));

			if ($.get(isNew)) {
				const createData = {
					title: $.get(maintenance).title,
					description: $.get(maintenance).description || null,
					start_date_time: startTime,
					rrule,
					duration_seconds: $.get(calculatedDurationSeconds),
					monitors: $.get(selectedMonitors).map((m) => ({ monitor_tag: m.tag, monitor_impact: m.status })),
					is_global: $.get(maintenance).is_global
				};

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "createMaintenance", data: createData })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Maintenance created successfully");
					goto(clientResolver(resolve, `/manage/app/maintenances/${result.maintenance_id}`));
				}
			} else {
				const updateData = {
					id: $.get(maintenance).id,
					title: $.get(maintenance).title,
					description: $.get(maintenance).description || null,
					start_date_time: startTime,
					rrule,
					duration_seconds: $.get(calculatedDurationSeconds),
					status: $.get(maintenance).status,
					monitors: $.get(selectedMonitors).map((m) => ({ monitor_tag: m.tag, monitor_impact: m.status })),
					is_global: $.get(maintenance).is_global
				};

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "updateMaintenance", data: updateData })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Maintenance updated successfully");
				}
			}
		} catch(e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			$.set(saving, false);
		}
	}

	// Delete maintenance
	async function deleteMaintenance() {
		if (!confirm("Are you sure you want to delete this maintenance? All events will also be deleted.")) return;

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteMaintenance",
					data: { id: $.get(maintenance).id }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Maintenance deleted");
				goto(clientResolver(resolve, "/manage/app/maintenances"));
			}
		} catch {
			toast.error("Failed to delete maintenance");
		}
	}

	// Delete event
	async function deleteEvent(eventId) {
		if (!confirm("Are you sure you want to delete this event?")) return;

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "deleteMaintenanceEvent", data: { id: eventId } })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Event deleted");
				await fetchEvents();
			}
		} catch {
			toast.error("Failed to delete event");
		}
	}

	// Manually transition an event to COMPLETED or CANCELLED
	async function updateEventStatus(eventId, status) {
		$.set(updatingEventStatus, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updateMaintenanceEventStatus",
					data: { id: eventId, status }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(status === "COMPLETED" ? "Event completed" : "Event cancelled");
				await fetchEvents();
				closeEventStatusDialog();
			}
		} catch {
			toast.error("Failed to update event status");
		} finally {
			$.set(updatingEventStatus, false);
		}
	}

	async function confirmEventStatusUpdate() {
		if (!$.get(pendingEventStatusUpdate)) return;

		await updateEventStatus($.get(pendingEventStatusUpdate).eventId, $.get(pendingEventStatusUpdate).status);
	}

	// Compute event display status based on current time
	function getEventDisplayStatus(event) {
		// Terminal statuses no longer follow time — the stored status wins
		if (event.status === "CANCELLED") {
			return { label: "Cancelled", variant: "destructive", icon: "x" };
		}

		if (event.status === "COMPLETED") {
			return { label: "Completed", variant: "secondary", icon: "check" };
		}

		const now = new Date();
		const startDate = new Date(event.start_date_time * 1000);
		const endDate = new Date(event.end_date_time * 1000);

		// Check if currently ongoing
		if (isWithinInterval(now, { start: startDate, end: endDate })) {
			return { label: "Ongoing", variant: "default", icon: "play" };
		}

		// Check if in the future (upcoming)
		if (isFuture(startDate)) {
			const distance = formatDistanceToNow(startDate, { addSuffix: false });

			return {
				label: `Upcoming • starts in ${distance}`,
				variant: "outline",
				icon: "clock"
			};
		}

		// If in the past (completed)
		if (isPast(endDate)) {
			return { label: "Completed", variant: "secondary", icon: "check" };
		}

		// Fallback
		return { label: "Scheduled", variant: "outline", icon: "clock" };
	}

	// Toggle monitor selection
	function toggleMonitor(tag) {
		const existing = $.get(selectedMonitors).find((m) => m.tag === tag);

		if (existing) {
			$.set(selectedMonitors, $.get(selectedMonitors).filter((m) => m.tag !== tag), true);
		} else {
			$.set(selectedMonitors, [...$.get(selectedMonitors), { tag, status: "MAINTENANCE" }], true);
		}
	}

	// Update monitor status locally
	function updateMonitorStatus(tag, status) {
		$.set(selectedMonitors, $.get(selectedMonitors).map((m) => m.tag === tag ? { ...m, status } : m), true);
	}

	// Get monitor name by tag
	function getMonitorName(tag) {
		const monitor = $.get(availableMonitors).find((m) => m.tag === tag);

		return monitor?.name || tag;
	}

	onMount(() => {
		fetchMaintenance();
		fetchAvailableMonitors();
	});

	var fragment = root_35();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => clientResolver(resolve, "/manage/app/maintenances"));

											$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
												Breadcrumb_Link($$anchor, {
													get href() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Maintenances');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
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
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(isNew) ? "New Maintenance" : `Edit #${$$props.params.id}`));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
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

	var div_2 = $.sibling(node, 2);
	var node_7 = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => clientResolver(resolve, `/maintenances/${$.get(maintenance).id}?type=maintenance`));

				Button($$anchor, {
					variant: 'outline',
					target: '_blank',
					size: 'sm',
					class: 'mr-2',
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
		};

		$.if(node_7, ($$render) => {
			if (!$.get(isNew)) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var node_9 = $.child(div_3);

			Spinner(node_9, { class: 'size-8' });
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_10 = $.first_child(fragment_7);

			$.component(node_10, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'border-destructive',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_11 = $.first_child(fragment_8);

						$.component(node_11, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var div_4 = root_2();
									var node_12 = $.child(div_4);

									AlertTriangleIcon(node_12, { class: 'text-destructive size-5' });

									var p = $.sibling(node_12, 2);
									var text_3 = $.only_child(p, true);

									$.reset(div_4);
									$.template_effect(() => $.set_text(text_3, $.get(error)));
									$.append($$anchor, div_4);
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
		};

		var alternate_5 = ($$anchor) => {
			var fragment_9 = root_3();
			var node_13 = $.first_child(fragment_9);

			$.component(node_13, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root();
						var node_14 = $.first_child(fragment_10);

						$.component(node_14, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_3();
									var node_15 = $.first_child(fragment_11);

									$.component(node_15, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, $.get(isNew) ? "Create New Maintenance" : "Maintenance Details"));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = $.comment();
												var node_17 = $.first_child(fragment_13);

												{
													var consequent_3 = ($$anchor) => {
														var text_5 = $.text('Schedule a new maintenance window using iCalendar RRULE format');

														$.append($$anchor, text_5);
													};

													var alternate = ($$anchor) => {
														var text_6 = $.text('Edit maintenance details');

														$.append($$anchor, text_6);
													};

													$.if(node_17, ($$render) => {
														if ($.get(isNew)) $$render(consequent_3); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_14, 2);

						$.component(node_18, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_26();
									var div_5 = $.first_child(fragment_14);
									var node_19 = $.child(div_5);

									Label(node_19, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_15 = root_4();

											$.next();
											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
										RadioGroup_Root($$anchor, {
											class: 'flex gap-6',
											get value() {
												return $.get(scheduleType);
											},

											set value($$value) {
												$.set(scheduleType, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_7();
												var div_6 = $.first_child(fragment_16);
												var node_21 = $.child(div_6);

												$.component(node_21, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'ONE_TIME', id: 'type-onetime' });
												});

												var node_22 = $.sibling(node_21, 2);

												Label(node_22, {
													for: 'type-onetime',
													class: 'flex cursor-pointer items-center gap-2 font-normal',
													children: ($$anchor, $$slotProps) => {
														var fragment_17 = root_5();
														var node_23 = $.first_child(fragment_17);

														CalendarIcon(node_23, { class: 'size-4' });
														$.next();
														$.append($$anchor, fragment_17);
													},
													$$slots: { default: true }
												});

												$.reset(div_6);

												var div_7 = $.sibling(div_6, 2);
												var node_24 = $.child(div_7);

												$.component(node_24, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'RECURRING', id: 'type-recurring' });
												});

												var node_25 = $.sibling(node_24, 2);

												Label(node_25, {
													for: 'type-recurring',
													class: 'flex cursor-pointer items-center gap-2 font-normal',
													children: ($$anchor, $$slotProps) => {
														var fragment_18 = root_6();
														var node_26 = $.first_child(fragment_18);

														RepeatIcon(node_26, { class: 'size-4' });
														$.next();
														$.append($$anchor, fragment_18);
													},
													$$slots: { default: true }
												});

												$.reset(div_7);
												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_5);

									var div_8 = $.sibling(div_5, 2);
									var node_27 = $.child(div_8);

									Label(node_27, {
										for: 'title',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_19 = root_8();

											$.next();
											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});

									var node_28 = $.sibling(node_27, 2);

									Input(node_28, {
										id: 'title',
										placeholder: 'Scheduled maintenance window',
										get value() {
											return $.get(maintenance).title;
										},

										set value($$value) {
											$.get(maintenance).title = $$value;
										}
									});

									$.reset(div_8);

									var div_9 = $.sibling(div_8, 2);
									var node_29 = $.child(div_9);

									Label(node_29, {
										for: 'description',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Description');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_30 = $.sibling(node_29, 2);

									Textarea(node_30, {
										id: 'description',
										placeholder: 'Details about the maintenance...',
										rows: 3,
										get value() {
											return $.get(maintenance).description;
										},

										set value($$value) {
											$.get(maintenance).description = $$value;
										}
									});

									$.reset(div_9);

									var div_10 = $.sibling(div_9, 2);
									var div_11 = $.child(div_10);
									var node_31 = $.child(div_11);

									Label(node_31, {
										for: 'is-global',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Global Maintenance');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_11);

									var node_32 = $.sibling(div_11, 2);

									{
										let $0 = $.derived(() => $.get(maintenance).is_global === "YES");

										Switch(node_32, {
											id: 'is-global',
											get checked() {
												return $.get($0);
											},

											onCheckedChange: (checked) => {
												$.get(maintenance).is_global = checked ? "YES" : "NO";
											}
										});
									}

									$.reset(div_10);

									var div_12 = $.sibling(div_10, 2);
									var node_33 = $.child(div_12);

									Label(node_33, {
										for: 'start-time',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_20 = root_9();
											var text_9 = $.first_child(fragment_20);

											$.next();
											$.template_effect(() => $.set_text(text_9, `${$.get(scheduleType) === "ONE_TIME" ? "Start Date/Time" : "First Occurrence Date/Time"} `));
											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});

									var node_34 = $.sibling(node_33, 2);

									Input(node_34, {
										id: 'start-time',
										type: 'datetime-local',
										get value() {
											return $.get(startDateTimeLocal);
										},

										set value($$value) {
											$.set(startDateTimeLocal, $$value, true);
										}
									});

									var node_35 = $.sibling(node_34, 2);

									{
										var consequent_4 = ($$anchor) => {
											var p_1 = root_10();

											$.append($$anchor, p_1);
										};

										$.if(node_35, ($$render) => {
											if ($.get(scheduleType) === "RECURRING") $$render(consequent_4);
										});
									}

									$.reset(div_12);

									var div_13 = $.sibling(div_12, 2);
									var node_36 = $.child(div_13);

									Label(node_36, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_21 = root_11();

											$.next();
											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});

									var div_14 = $.sibling(node_36, 2);
									var div_15 = $.child(div_14);
									var node_37 = $.child(div_15);

									Input(node_37, {
										type: 'number',
										min: 0,
										max: 72,
										class: 'w-20',
										get value() {
											return $.get(durationHours);
										},

										set value($$value) {
											$.set(durationHours, $$value, true);
										}
									});

									$.next(2);
									$.reset(div_15);

									var div_16 = $.sibling(div_15, 2);
									var node_38 = $.child(div_16);

									Input(node_38, {
										type: 'number',
										min: 0,
										max: 59,
										class: 'w-20',
										get value() {
											return $.get(durationMinutes);
										},

										set value($$value) {
											$.set(durationMinutes, $$value, true);
										}
									});

									$.next(2);
									$.reset(div_16);
									$.reset(div_14);

									var p_2 = $.sibling(div_14, 2);
									var text_10 = $.only_child(p_2);

									$.reset(div_13);

									var node_39 = $.sibling(div_13, 2);

									$.component(node_39, () => Card.Root, ($$anchor, Card_Root_2) => {
										Card_Root_2($$anchor, {
											class: 'bg-muted/50',
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = root_3();
												var node_40 = $.first_child(fragment_22);

												$.component(node_40, () => Card.Header, ($$anchor, Card_Header_1) => {
													Card_Header_1($$anchor, {
														class: 'pb-3',
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = $.comment();
															var node_41 = $.first_child(fragment_23);

															$.component(node_41, () => Card.Title, ($$anchor, Card_Title_1) => {
																Card_Title_1($$anchor, {
																	class: 'flex items-center gap-2 text-base',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = root_12();
																		var node_42 = $.first_child(fragment_24);

																		InfoIcon(node_42, { class: 'size-4' });

																		var text_11 = $.sibling(node_42);

																		$.template_effect(() => $.set_text(text_11, ` ${$.get(scheduleType) === "ONE_TIME" ? "Schedule Pattern" : "Recurrence Pattern (RRULE)"}`));
																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														},
														$$slots: { default: true }
													});
												});

												var node_43 = $.sibling(node_40, 2);

												$.component(node_43, () => Card.Content, ($$anchor, Card_Content_2) => {
													Card_Content_2($$anchor, {
														class: 'space-y-4',
														children: ($$anchor, $$slotProps) => {
															var fragment_25 = $.comment();
															var node_44 = $.first_child(fragment_25);

															{
																var consequent_5 = ($$anchor) => {
																	var div_17 = root_13();
																	var node_45 = $.child(div_17);

																	Label(node_45, {
																		class: 'text-muted-foreground text-xs',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text('iCalendar RRULE (auto-generated)');

																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});

																	var node_46 = $.sibling(node_45, 2);

																	Input(node_46, {
																		value: 'FREQ=MINUTELY;COUNT=1',
																		disabled: true,
																		class: 'bg-muted font-mono text-sm'
																	});

																	$.next(2);
																	$.reset(div_17);
																	$.append($$anchor, div_17);
																};

																var alternate_1 = ($$anchor) => {
																	var fragment_26 = root_19();
																	var div_18 = $.first_child(fragment_26);
																	var node_47 = $.child(div_18);

																	Label(node_47, {
																		for: 'rrule',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_27 = root_14();

																			$.next();
																			$.append($$anchor, fragment_27);
																		},
																		$$slots: { default: true }
																	});

																	var node_48 = $.sibling(node_47, 2);

																	{
																		let $0 = $.derived(() => $.get(rruleError) ? "border-destructive" : "");

																		Input(node_48, {
																			id: 'rrule',
																			placeholder: 'FREQ=WEEKLY;BYDAY=SU',
																			get class() {
																				return $.get($0);
																			},

																			get value() {
																				return $.get(customRrule);
																			},

																			set value($$value) {
																				$.set(customRrule, $$value, true);
																			}
																		});
																	}

																	var node_49 = $.sibling(node_48, 2);

																	{
																		var consequent_6 = ($$anchor) => {
																			var p_3 = root_15();
																			var text_13 = $.only_child(p_3, true);

																			$.template_effect(() => $.set_text(text_13, $.get(rruleError)));
																			$.append($$anchor, p_3);
																		};

																		$.if(node_49, ($$render) => {
																			if ($.get(rruleError)) $$render(consequent_6);
																		});
																	}

																	$.reset(div_18);

																	var node_50 = $.sibling(div_18, 2);

																	{
																		var consequent_7 = ($$anchor) => {
																			var div_19 = root_16();
																			var node_51 = $.child(div_19);

																			Label(node_51, {
																				class: 'text-muted-foreground text-xs',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text('Quick Patterns:');

																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});

																			var div_20 = $.sibling(node_51, 2);

																			$.each(div_20, 21, () => sampleRrules, (sample) => sample.value, ($$anchor, sample) => {
																				{
																					let $0 = $.derived(() => $.get(customRrule) === $.get(sample).value ? "default" : "outline");

																					Button($$anchor, {
																						get variant() {
																							return $.get($0);
																						},
																						size: 'sm',
																						onclick: () => $.set(customRrule, $.get(sample).value, true),
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_15 = $.text();

																							$.template_effect(() => $.set_text(text_15, $.get(sample).label));
																							$.append($$anchor, text_15);
																						},
																						$$slots: { default: true }
																					});
																				}
																			});

																			$.reset(div_20);
																			$.reset(div_19);
																			$.append($$anchor, div_19);
																		};

																		$.if(node_50, ($$render) => {
																			if ($.get(isNew)) $$render(consequent_7);
																		});
																	}

																	var node_52 = $.sibling(node_50, 2);

																	{
																		var consequent_8 = ($$anchor) => {
																			var div_21 = root_18();
																			var node_53 = $.child(div_21);

																			Label(node_53, {
																				class: 'text-muted-foreground text-xs',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_16 = $.text('Upcoming Occurrences:');

																					$.append($$anchor, text_16);
																				},
																				$$slots: { default: true }
																			});

																			var ul = $.sibling(node_53, 2);

																			$.each(ul, 20, () => $.get(previewDates), (date) => date, ($$anchor, date) => {
																				var li = root_17();
																				var node_54 = $.child(li);

																				CalendarIcon(node_54, { class: 'text-muted-foreground size-3' });

																				var text_17 = $.sibling(node_54);

																				$.reset(li);
																				$.template_effect(() => $.set_text(text_17, ` ${date ?? ''}`));
																				$.append($$anchor, li);
																			});

																			$.reset(ul);
																			$.reset(div_21);
																			$.append($$anchor, div_21);
																		};

																		$.if(node_52, ($$render) => {
																			if ($.get(previewDates).length > 0) $$render(consequent_8);
																		});
																	}

																	$.append($$anchor, fragment_26);
																};

																$.if(node_44, ($$render) => {
																	if ($.get(scheduleType) === "ONE_TIME") $$render(consequent_5); else $$render(alternate_1, -1);
																});
															}

															$.append($$anchor, fragment_25);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									});

									var div_22 = $.sibling(node_39, 2);
									var node_55 = $.child(div_22);

									Label(node_55, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Affected Monitors');

											$.append($$anchor, text_18);
										},
										$$slots: { default: true }
									});

									var div_23 = $.sibling(node_55, 2);
									var node_56 = $.child(div_23);

									Label(node_56, {
										class: 'text-muted-foreground mb-2 block text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Select monitors to add:');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									var div_24 = $.sibling(node_56, 2);
									var node_57 = $.child(div_24);

									$.each(node_57, 17, () => $.get(availableMonitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
										var div_25 = root_20();
										var node_58 = $.child(div_25);

										{
											let $0 = $.derived(() => $.get(selectedMonitorTags).includes($.get(monitor).tag));

											Checkbox(node_58, {
												get id() {
													return `monitor-${$.get(monitor).tag ?? ''}`;
												},

												get checked() {
													return $.get($0);
												},
												onCheckedChange: () => toggleMonitor($.get(monitor).tag)
											});
										}

										var node_59 = $.sibling(node_58, 2);

										Label(node_59, {
											get for() {
												return `monitor-${$.get(monitor).tag ?? ''}`;
											},
											class: 'cursor-pointer text-sm font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text();

												$.template_effect(() => $.set_text(text_20, $.get(monitor).name));
												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});

										$.reset(div_25);
										$.append($$anchor, div_25);
									});

									var node_60 = $.sibling(node_57, 2);

									{
										var consequent_9 = ($$anchor) => {
											var p_4 = root_21();

											$.append($$anchor, p_4);
										};

										$.if(node_60, ($$render) => {
											if ($.get(availableMonitors).length === 0) $$render(consequent_9);
										});
									}

									$.reset(div_24);
									$.reset(div_23);

									var node_61 = $.sibling(div_23, 2);

									{
										var consequent_10 = ($$anchor) => {
											var div_26 = root_24();
											var node_62 = $.child(div_26);

											Label(node_62, {
												class: 'text-muted-foreground mb-2 block text-xs',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text('Monitor status during maintenance:');

													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});

											var div_27 = $.sibling(node_62, 2);

											$.each(div_27, 23, () => $.get(selectedMonitors), (selectedMonitor) => selectedMonitor.tag, ($$anchor, selectedMonitor, index) => {
												const currentStatus = $.derived(() => $.get(selectedMonitor).status);
												var div_28 = root_23();
												var span = $.child(div_28);
												var text_22 = $.only_child(span, true);
												var node_63 = $.sibling(span, 2);

												$.component(node_63, () => Select.Root, ($$anchor, Select_Root) => {
													Select_Root($$anchor, {
														type: 'single',
														get value() {
															return $.get(currentStatus);
														},

														onValueChange: (value) => {
															if (value) {
																$.get(selectedMonitors)[$.get(index)].status = value;
																$.set(selectedMonitors, [...$.get(selectedMonitors)], true);
															}
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_31 = root_3();
															var node_64 = $.first_child(fragment_31);

															$.component(node_64, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																Select_Trigger($$anchor, {
																	class: 'h-8 w-36 text-xs',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_23 = $.text();

																		$.template_effect(() => $.set_text(text_23, $.get(currentStatus)));
																		$.append($$anchor, text_23);
																	},
																	$$slots: { default: true }
																});
															});

															var node_65 = $.sibling(node_64, 2);

															$.component(node_65, () => Select.Content, ($$anchor, Select_Content) => {
																Select_Content($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_33 = root_22();
																		var node_66 = $.first_child(fragment_33);

																		$.component(node_66, () => Select.Item, ($$anchor, Select_Item) => {
																			Select_Item($$anchor, {
																				value: 'UP',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_24 = $.text('UP');

																					$.append($$anchor, text_24);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_67 = $.sibling(node_66, 2);

																		$.component(node_67, () => Select.Item, ($$anchor, Select_Item_1) => {
																			Select_Item_1($$anchor, {
																				value: 'DOWN',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_25 = $.text('DOWN');

																					$.append($$anchor, text_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_68 = $.sibling(node_67, 2);

																		$.component(node_68, () => Select.Item, ($$anchor, Select_Item_2) => {
																			Select_Item_2($$anchor, {
																				value: 'DEGRADED',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_26 = $.text('DEGRADED');

																					$.append($$anchor, text_26);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_69 = $.sibling(node_68, 2);

																		$.component(node_69, () => Select.Item, ($$anchor, Select_Item_3) => {
																			Select_Item_3($$anchor, {
																				value: 'MAINTENANCE',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_27 = $.text('MAINTENANCE');

																					$.append($$anchor, text_27);
																				},
																				$$slots: { default: true }
																			});
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

												$.reset(div_28);
												$.template_effect(($0) => $.set_text(text_22, $0), [() => getMonitorName($.get(selectedMonitor).tag)]);
												$.append($$anchor, div_28);
											});

											$.reset(div_27);
											$.reset(div_26);
											$.append($$anchor, div_26);
										};

										$.if(node_61, ($$render) => {
											if ($.get(selectedMonitors).length > 0) $$render(consequent_10);
										});
									}

									$.next(2);
									$.reset(div_22);

									var node_70 = $.sibling(div_22, 2);

									{
										var consequent_11 = ($$anchor) => {
											var div_29 = root_25();
											var node_71 = $.child(div_29);

											Label(node_71, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_28 = $.text('Status');

													$.append($$anchor, text_28);
												},
												$$slots: { default: true }
											});

											var div_30 = $.sibling(node_71, 2);
											var node_72 = $.child(div_30);

											{
												let $0 = $.derived(() => $.get(maintenance).status === "ACTIVE" ? "default" : "outline");

												Button(node_72, {
													get variant() {
														return $.get($0);
													},
													size: 'sm',
													onclick: () => $.get(maintenance).status = "ACTIVE",
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_29 = $.text('Active');

														$.append($$anchor, text_29);
													},
													$$slots: { default: true }
												});
											}

											var node_73 = $.sibling(node_72, 2);

											{
												let $0 = $.derived(() => $.get(maintenance).status === "INACTIVE" ? "default" : "outline");

												Button(node_73, {
													get variant() {
														return $.get($0);
													},
													size: 'sm',
													onclick: () => $.get(maintenance).status = "INACTIVE",
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_30 = $.text('Inactive');

														$.append($$anchor, text_30);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_30);
											$.reset(div_29);
											$.append($$anchor, div_29);
										};

										$.if(node_70, ($$render) => {
											if (!$.get(isNew)) $$render(consequent_11);
										});
									}

									$.template_effect(($0) => $.set_text(text_10, `Total: ${$.get(calculatedDurationSeconds) ?? ''} seconds (${$0 ?? ''} minutes)`), [() => Math.floor($.get(calculatedDurationSeconds) / 60)]);
									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_74 = $.sibling(node_18, 2);

						$.component(node_74, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_34 = root_3();
									var node_75 = $.first_child(fragment_34);

									{
										var consequent_12 = ($$anchor) => {
											Button($$anchor, {
												variant: 'destructive',
												onclick: deleteMaintenance,
												children: ($$anchor, $$slotProps) => {
													var fragment_36 = root_27();
													var node_76 = $.first_child(fragment_36);

													TrashIcon(node_76, { class: 'size-4' });
													$.next();
													$.append($$anchor, fragment_36);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_75, ($$render) => {
											if (!$.get(isNew)) $$render(consequent_12);
										});
									}

									var node_77 = $.sibling(node_75, 2);

									{
										let $0 = $.derived(() => $.get(saving) || !$.get(isValid));

										Button(node_77, {
											onclick: saveMaintenance,
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_37 = root_12();
												var node_78 = $.first_child(fragment_37);

												{
													var consequent_13 = ($$anchor) => {
														Loader($$anchor, { class: 'size-4 animate-spin' });
													};

													var alternate_2 = ($$anchor) => {
														SaveIcon($$anchor, { class: 'size-4' });
													};

													$.if(node_78, ($$render) => {
														if ($.get(saving)) $$render(consequent_13); else $$render(alternate_2, -1);
													});
												}

												var text_31 = $.sibling(node_78);

												$.template_effect(() => $.set_text(text_31, ` ${$.get(isNew) ? "Create Maintenance" : "Save Changes"}`));
												$.append($$anchor, fragment_37);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_34);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			var node_79 = $.sibling(node_13, 2);

			{
				var consequent_21 = ($$anchor) => {
					var fragment_40 = $.comment();
					var node_80 = $.first_child(fragment_40);

					$.component(node_80, () => Card.Root, ($$anchor, Card_Root_3) => {
						Card_Root_3($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_41 = root_3();
								var node_81 = $.first_child(fragment_41);

								$.component(node_81, () => Card.Header, ($$anchor, Card_Header_2) => {
									Card_Header_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div_31 = root_28();
											var node_82 = $.child(div_31);

											$.component(node_82, () => Card.Title, ($$anchor, Card_Title_2) => {
												Card_Title_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_32 = $.text('Maintenance Events');

														$.append($$anchor, text_32);
													},
													$$slots: { default: true }
												});
											});

											var node_83 = $.sibling(node_82, 2);

											$.component(node_83, () => Card.Description, ($$anchor, Card_Description_1) => {
												Card_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_33 = $.text('Pre-generated maintenance windows for the next 7 days');

														$.append($$anchor, text_33);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_31);
											$.append($$anchor, div_31);
										},
										$$slots: { default: true }
									});
								});

								var node_84 = $.sibling(node_81, 2);

								$.component(node_84, () => Card.Content, ($$anchor, Card_Content_3) => {
									Card_Content_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_42 = $.comment();
											var node_85 = $.first_child(fragment_42);

											{
												var consequent_14 = ($$anchor) => {
													var div_32 = root_29();
													var node_86 = $.child(div_32);

													Spinner(node_86, { class: 'size-6' });
													$.reset(div_32);
													$.append($$anchor, div_32);
												};

												var consequent_15 = ($$anchor) => {
													var p_5 = root_30();

													$.append($$anchor, p_5);
												};

												var alternate_4 = ($$anchor) => {
													var div_33 = root_34();

													$.each(div_33, 21, () => $.get(events), (event) => event.id, ($$anchor, event) => {
														const displayStatus = $.derived(() => getEventDisplayStatus($.get(event)));
														var div_34 = root_33();
														var div_35 = $.child(div_34);
														var div_36 = $.child(div_35);
														var node_87 = $.child(div_36);

														{
															var consequent_16 = ($$anchor) => {
																PlayCircleIcon($$anchor, { class: 'text-primary size-4' });
															};

															var consequent_17 = ($$anchor) => {
																CheckCircleIcon($$anchor, { class: 'text-muted-foreground size-4' });
															};

															var consequent_18 = ($$anchor) => {
																XCircleIcon($$anchor, { class: 'text-muted-foreground size-4' });
															};

															var alternate_3 = ($$anchor) => {
																ClockIcon($$anchor, { class: 'text-muted-foreground size-4' });
															};

															$.if(node_87, ($$render) => {
																if ($.get(displayStatus).icon === "play") $$render(consequent_16); else if ($.get(displayStatus).icon === "check") $$render(consequent_17, 1); else if ($.get(displayStatus).icon === "x") $$render(consequent_18, 2); else $$render(alternate_3, -1);
															});
														}

														$.reset(div_36);

														var div_37 = $.sibling(div_36, 2);
														var div_38 = $.child(div_37);
														var node_88 = $.child(div_38);

														Badge(node_88, {
															get variant() {
																return $.get(displayStatus).variant;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_34 = $.text();

																$.template_effect(() => $.set_text(text_34, $.get(displayStatus).label));
																$.append($$anchor, text_34);
															},
															$$slots: { default: true }
														});

														$.reset(div_38);

														var p_6 = $.sibling(div_38, 2);
														var text_35 = $.only_child(p_6);

														$.reset(div_37);
														$.reset(div_35);

														var div_39 = $.sibling(div_35, 2);
														var node_89 = $.child(div_39);

														{
															var consequent_19 = ($$anchor) => {
																Button($$anchor, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => openEventStatusDialog($.get(event).id, "COMPLETED"),
																	children: ($$anchor, $$slotProps) => {
																		var fragment_49 = root_31();
																		var node_90 = $.first_child(fragment_49);

																		CheckCircleIcon(node_90, { class: 'size-4' });
																		$.next();
																		$.append($$anchor, fragment_49);
																	},
																	$$slots: { default: true }
																});
															};

															$.if(node_89, ($$render) => {
																if ($.get(event).status === "ONGOING") $$render(consequent_19);
															});
														}

														var node_91 = $.sibling(node_89, 2);

														{
															var consequent_20 = ($$anchor) => {
																Button($$anchor, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => openEventStatusDialog($.get(event).id, "CANCELLED"),
																	children: ($$anchor, $$slotProps) => {
																		var fragment_51 = root_32();
																		var node_92 = $.first_child(fragment_51);

																		XCircleIcon(node_92, { class: 'size-4' });
																		$.next();
																		$.append($$anchor, fragment_51);
																	},
																	$$slots: { default: true }
																});
															};

															$.if(node_91, ($$render) => {
																if ($.get(event).status === "SCHEDULED" || $.get(event).status === "READY" || $.get(event).status === "ONGOING") $$render(consequent_20);
															});
														}

														var node_93 = $.sibling(node_91, 2);

														Button(node_93, {
															variant: 'ghost',
															size: 'icon',
															onclick: () => deleteEvent($.get(event).id),
															children: ($$anchor, $$slotProps) => {
																TrashIcon($$anchor, { class: 'size-4' });
															},
															$$slots: { default: true }
														});

														$.reset(div_39);
														$.reset(div_34);

														$.template_effect(
															($0, $1) => $.set_text(text_35, `${$0 ?? ''}
                        →
                        ${$1 ?? ''}`),
															[
																() => format(new Date($.get(event).start_date_time * 1000), "MMM d, yyyy HH:mm"),
																() => format(new Date($.get(event).end_date_time * 1000), "MMM d, yyyy HH:mm")
															]
														);

														$.append($$anchor, div_34);
													});

													$.reset(div_33);
													$.append($$anchor, div_33);
												};

												$.if(node_85, ($$render) => {
													if ($.get(loadingEvents)) $$render(consequent_14); else if ($.get(events).length === 0) $$render(consequent_15, 1); else $$render(alternate_4, -1);
												});
											}

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

					$.append($$anchor, fragment_40);
				};

				$.if(node_79, ($$render) => {
					if (!$.get(isNew)) $$render(consequent_21);
				});
			}

			$.append($$anchor, fragment_9);
		};

		$.if(node_8, ($$render) => {
			if ($.get(loading)) $$render(consequent_1); else if ($.get(error)) $$render(consequent_2, 1); else $$render(alternate_5, -1);
		});
	}

	$.reset(div);

	var node_94 = $.sibling(div, 2);

	$.component(node_94, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(eventStatusDialogOpen);
			},

			set open($$value) {
				$.set(eventStatusDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_53 = $.comment();
				var node_95 = $.first_child(fragment_53);

				$.component(node_95, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_54 = root_3();
							var node_96 = $.first_child(fragment_54);

							$.component(node_96, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_55 = root_3();
										var node_97 = $.first_child(fragment_55);

										$.component(node_97, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_36 = $.text();

													$.template_effect(() => $.set_text(text_36, $.get(eventStatusDialogCopy).title));
													$.append($$anchor, text_36);
												},
												$$slots: { default: true }
											});
										});

										var node_98 = $.sibling(node_97, 2);

										$.component(node_98, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_37 = $.text();

													$.template_effect(() => $.set_text(text_37, $.get(eventStatusDialogCopy).description));
													$.append($$anchor, text_37);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_55);
									},
									$$slots: { default: true }
								});
							});

							var node_99 = $.sibling(node_96, 2);

							$.component(node_99, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_58 = root_3();
										var node_100 = $.first_child(fragment_58);

										Button(node_100, {
											variant: 'outline',
											onclick: closeEventStatusDialog,
											get disabled() {
												return $.get(updatingEventStatus);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_38 = $.text();

												$.template_effect(() => $.set_text(text_38, $.get(eventStatusDialogCopy).cancelLabel));
												$.append($$anchor, text_38);
											},
											$$slots: { default: true }
										});

										var node_101 = $.sibling(node_100, 2);

										{
											let $0 = $.derived(() => $.get(updatingEventStatus) || !$.get(pendingEventStatusUpdate));

											Button(node_101, {
												get variant() {
													return $.get(eventStatusDialogCopy).confirmVariant;
												},
												onclick: confirmEventStatusUpdate,
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_60 = root_12();
													var node_102 = $.first_child(fragment_60);

													{
														var consequent_22 = ($$anchor) => {
															Loader($$anchor, { class: 'size-4 animate-spin' });
														};

														$.if(node_102, ($$render) => {
															if ($.get(updatingEventStatus)) $$render(consequent_22);
														});
													}

													var text_39 = $.sibling(node_102);

													$.template_effect(() => $.set_text(text_39, ` ${$.get(eventStatusDialogCopy).confirmLabel ?? ''}`));
													$.append($$anchor, fragment_60);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_58);
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
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}