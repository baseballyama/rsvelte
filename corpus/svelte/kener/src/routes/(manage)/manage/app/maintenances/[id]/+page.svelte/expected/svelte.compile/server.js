import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params } = $$props;
		const isNew = $.derived(() => params.id === "new");

		// Types
		// Form state
		let loading = true;

		let saving = false;
		let error = null;

		// Schedule type for UI switching
		let scheduleType = "ONE_TIME";

		// Maintenance data
		let maintenance = {
			id: 0,
			title: "",
			description: "",
			start_date_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
			rrule: "FREQ=MINUTELY;COUNT=1",
			duration_seconds: 3600, // 1 hour default
			status: "ACTIVE",
			is_global: "YES"
		};

		// For datetime input
		let startDateTimeLocal = "";

		// Duration inputs (for easier UI)
		let durationHours = 1;

		let durationMinutes = 0;

		// Custom RRULE input for recurring
		let customRrule = "FREQ=WEEKLY;BYDAY=SU";

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
		let availableMonitors = [];

		let selectedMonitors = [];

		// Derived for backward compatibility
		const selectedMonitorTags = $.derived(() => selectedMonitors.map((m) => m.tag));

		// Events for existing maintenance
		let events = [];

		let loadingEvents = false;

		// Event status confirmation dialog
		let eventStatusDialogOpen = false;

		let updatingEventStatus = false;
		let pendingEventStatusUpdate = null;

		function openEventStatusDialog(eventId, status) {
			pendingEventStatusUpdate = { eventId, status };
			eventStatusDialogOpen = true;
		}

		function closeEventStatusDialog() {
			eventStatusDialogOpen = false;
			pendingEventStatusUpdate = null;
		}

		const eventStatusDialogCopy = $.derived(() => {
			if (pendingEventStatusUpdate?.status === "COMPLETED") {
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
			if (scheduleType === "ONE_TIME") {
				return "FREQ=MINUTELY;COUNT=1";
			}

			return customRrule;
		}

		// Parse RRULE string for UI
		function parseRrule(rrule) {
			if (rrule.includes("COUNT=1")) {
				scheduleType = "ONE_TIME";
			} else {
				scheduleType = "RECURRING";
				customRrule = rrule;
			}
		}

		// Generate preview dates based on RRULE and start time
		function getPreviewDates() {
			if (scheduleType === "ONE_TIME" || !startDateTimeLocal || !customRrule.trim()) {
				return [];
			}

			try {
				const dtstart = new Date(startDateTimeLocal);
				const fullRrule = `DTSTART:${dtstart.toISOString().replace(/[-:]/g, "").split(".")[0]}Z\nRRULE:${customRrule}`;
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
			if (scheduleType === "ONE_TIME" || !customRrule.trim()) {
				return null;
			}

			try {
				const dtstart = new Date();
				const fullRrule = `DTSTART:${dtstart.toISOString().replace(/[-:]/g, "").split(".")[0]}Z\nRRULE:${customRrule}`;

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
		const calculatedDurationSeconds = $.derived(() => durationHours * 3600 + durationMinutes * 60);

		// Update duration inputs when duration_seconds changes
		function updateDurationInputs(seconds) {
			durationHours = Math.floor(seconds / 3600);
			durationMinutes = Math.floor(seconds % 3600 / 60);
		}

		// Validation
		const isValid = $.derived(() => {
			if (!maintenance.title.trim()) return false;
			if (!startDateTimeLocal) return false;
			if (calculatedDurationSeconds() <= 0) return false;
			if (scheduleType === "RECURRING" && (!customRrule.trim() || rruleError())) return false;

			return true;
		});

		// Fetch maintenance data
		async function fetchMaintenance() {
			if (isNew()) {
				// Set default start time (1 hour from now)
				startDateTimeLocal = timestampToLocalDatetime(Math.floor(Date.now() / 1000) + 3600);

				loading = false;

				return;
			}

			loading = true;
			error = null;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMaintenance", data: { id: parseInt(params.id) } })
				});

				const result = await response.json();

				if (result.error) {
					error = result.error;
				} else if (result) {
					maintenance = {
						id: result.id,
						title: result.title,
						description: result.description || "",
						start_date_time: result.start_date_time,
						rrule: result.rrule,
						duration_seconds: result.duration_seconds,
						status: result.status,
						is_global: result.is_global || "YES"
					};

					// Parse RRULE for UI
					parseRrule(result.rrule);

					// Set UI values
					startDateTimeLocal = timestampToLocalDatetime(result.start_date_time);

					updateDurationInputs(result.duration_seconds);

					// Set monitors with their statuses
					if (result.monitors) {
						selectedMonitors = result.monitors.map((m) => ({
							tag: m.monitor_tag,
							status: m.monitor_impact || "MAINTENANCE"
						}));
					}

					events = result.events || [];
				} else {
					error = "Maintenance not found";
				}
			} catch(e) {
				error = e instanceof Error ? e.message : "Failed to fetch maintenance";
			} finally {
				loading = false;
			}
		}

		// Fetch events
		async function fetchEvents() {
			loadingEvents = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getMaintenanceEvents",
						data: { maintenance_id: parseInt(params.id) }
					})
				});

				const result = await response.json();

				if (!result.error) {
					events = result;
				}
			} catch {
				// Ignore errors
			} finally {
				loadingEvents = false;
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

		// Save maintenance
		async function saveMaintenance() {
			if (!isValid()) return;

			saving = true;
			error = null;

			try {
				const rrule = getRrule();
				const startTime = localDatetimeToTimestamp(startDateTimeLocal);

				if (isNew()) {
					const createData = {
						title: maintenance.title,
						description: maintenance.description || null,
						start_date_time: startTime,
						rrule,
						duration_seconds: calculatedDurationSeconds(),
						monitors: selectedMonitors.map((m) => ({ monitor_tag: m.tag, monitor_impact: m.status })),
						is_global: maintenance.is_global
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
						id: maintenance.id,
						title: maintenance.title,
						description: maintenance.description || null,
						start_date_time: startTime,
						rrule,
						duration_seconds: calculatedDurationSeconds(),
						status: maintenance.status,
						monitors: selectedMonitors.map((m) => ({ monitor_tag: m.tag, monitor_impact: m.status })),
						is_global: maintenance.is_global
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
				saving = false;
			}
		}

		// Delete maintenance
		async function deleteMaintenance() {
			if (!confirm("Are you sure you want to delete this maintenance? All events will also be deleted.")) return;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "deleteMaintenance", data: { id: maintenance.id } })
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
			updatingEventStatus = true;

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
				updatingEventStatus = false;
			}
		}

		async function confirmEventStatusUpdate() {
			if (!pendingEventStatusUpdate) return;

			await updateEventStatus(pendingEventStatusUpdate.eventId, pendingEventStatusUpdate.status);
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
			const existing = selectedMonitors.find((m) => m.tag === tag);

			if (existing) {
				selectedMonitors = selectedMonitors.filter((m) => m.tag !== tag);
			} else {
				selectedMonitors = [...selectedMonitors, { tag, status: "MAINTENANCE" }];
			}
		}

		// Update monitor status locally
		function updateMonitorStatus(tag, status) {
			selectedMonitors = selectedMonitors.map((m) => m.tag === tag ? { ...m, status } : m);
		}

		// Get monitor name by tag
		function getMonitorName(tag) {
			const monitor = availableMonitors.find((m) => m.tag === tag);

			return monitor?.name || tag;
		}

		onMount(() => {
			fetchMaintenance();
			fetchAvailableMonitors();
		});

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
														href: clientResolver(resolve, "/manage/app/maintenances"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Maintenances`);
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
															$$renderer.push(`<!---->${$.escape(isNew() ? "New Maintenance" : `Edit #${params.id}`)}`);
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

			$$renderer.push(` <div>`);

			if (!isNew()) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					target: '_blank',
					size: 'sm',
					class: 'mr-2',
					href: clientResolver(resolve, `/maintenances/${maintenance.id}?type=maintenance`),
					children: ($$renderer) => {
						$$renderer.push(`<!---->View`);
					},
					$$slots: { default: true }
				});
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
													$$renderer.push(`<!---->${$.escape(isNew() ? "Create New Maintenance" : "Maintenance Details")}`);
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
														$$renderer.push(`<!--[0-->Schedule a new maintenance window using iCalendar RRULE format`);
													} else {
														$$renderer.push(`<!--[-1-->Edit maintenance details`);
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
										$$renderer.push(`<div class="flex flex-col gap-3">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Schedule Type <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (RadioGroup.Root) {
											$$renderer.push('<!--[-->');

											RadioGroup.Root($$renderer, {
												class: 'flex gap-6',
												get value() {
													return scheduleType;
												},

												set value($$value) {
													scheduleType = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center gap-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'ONE_TIME', id: 'type-onetime' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'type-onetime',
														class: 'flex cursor-pointer items-center gap-2 font-normal',
														children: ($$renderer) => {
															CalendarIcon($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> One-Time`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'RECURRING', id: 'type-recurring' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'type-recurring',
														class: 'flex cursor-pointer items-center gap-2 font-normal',
														children: ($$renderer) => {
															RepeatIcon($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> Recurring`);
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

										$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'title',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Title <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'title',
											placeholder: 'Scheduled maintenance window',
											get value() {
												return maintenance.title;
											},

											set value($$value) {
												maintenance.title = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'description',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Description`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Textarea($$renderer, {
											id: 'description',
											placeholder: 'Details about the maintenance...',
											rows: 3,
											get value() {
												return maintenance.description;
											},

											set value($$value) {
												maintenance.description = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between rounded-md border p-3"><div class="flex flex-col gap-1">`);

										Label($$renderer, {
											for: 'is-global',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Global Maintenance`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">When enabled, this maintenance will be visible on all status pages</p></div> `);

										Switch($$renderer, {
											id: 'is-global',
											checked: maintenance.is_global === "YES",
											onCheckedChange: (checked) => {
												maintenance.is_global = checked ? "YES" : "NO";
											}
										});

										$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'start-time',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(scheduleType === "ONE_TIME" ? "Start Date/Time" : "First Occurrence Date/Time")} <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'start-time',
											type: 'datetime-local',
											get value() {
												return startDateTimeLocal;
											},

											set value($$value) {
												startDateTimeLocal = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (scheduleType === "RECURRING") {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs">Recurring maintenances will occur at this same time of day. The date pattern is configured below.</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Duration <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex items-center gap-2"><div class="flex items-center gap-1">`);

										Input($$renderer, {
											type: 'number',
											min: 0,
											max: 72,
											class: 'w-20',
											get value() {
												return durationHours;
											},

											set value($$value) {
												durationHours = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">hours</span></div> <div class="flex items-center gap-1">`);

										Input($$renderer, {
											type: 'number',
											min: 0,
											max: 59,
											class: 'w-20',
											get value() {
												return durationMinutes;
											},

											set value($$value) {
												durationMinutes = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">minutes</span></div></div> <p class="text-muted-foreground text-xs">Total: ${$.escape(calculatedDurationSeconds())} seconds (${$.escape(Math.floor(calculatedDurationSeconds() / 60))} minutes)</p></div> `);

										if (Card.Root) {
											$$renderer.push('<!--[-->');

											Card.Root($$renderer, {
												class: 'bg-muted/50',
												children: ($$renderer) => {
													if (Card.Header) {
														$$renderer.push('<!--[-->');

														Card.Header($$renderer, {
															class: 'pb-3',
															children: ($$renderer) => {
																if (Card.Title) {
																	$$renderer.push('<!--[-->');

																	Card.Title($$renderer, {
																		class: 'flex items-center gap-2 text-base',
																		children: ($$renderer) => {
																			InfoIcon($$renderer, { class: 'size-4' });
																			$$renderer.push(`<!----> ${$.escape(scheduleType === "ONE_TIME" ? "Schedule Pattern" : "Recurrence Pattern (RRULE)")}`);
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
															class: 'space-y-4',
															children: ($$renderer) => {
																if (scheduleType === "ONE_TIME") {
																	$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

																	Label($$renderer, {
																		class: 'text-muted-foreground text-xs',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->iCalendar RRULE (auto-generated)`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Input($$renderer, {
																		value: 'FREQ=MINUTELY;COUNT=1',
																		disabled: true,
																		class: 'bg-muted font-mono text-sm'
																	});

																	$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">One-time maintenance uses a fixed RRULE that triggers only once.</p></div>`);
																} else {
																	$$renderer.push(`<!--[-1--><div class="flex flex-col gap-2">`);

																	Label($$renderer, {
																		for: 'rrule',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->iCalendar RRULE <span class="text-destructive">*</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Input($$renderer, {
																		id: 'rrule',
																		placeholder: 'FREQ=WEEKLY;BYDAY=SU',
																		class: rruleError() ? "border-destructive" : "",
																		get value() {
																			return customRrule;
																		},

																		set value($$value) {
																			customRrule = $$value;
																			$$settled = false;
																		}
																	});

																	$$renderer.push(`<!----> `);

																	if (rruleError()) {
																		$$renderer.push(`<!--[0--><p class="text-destructive text-xs">${$.escape(rruleError())}</p>`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--></div> `);

																	if (isNew()) {
																		$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

																		Label($$renderer, {
																			class: 'text-muted-foreground text-xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Quick Patterns:`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> <div class="flex flex-wrap gap-2"><!--[-->`);

																		const each_array = $.ensure_array_like(sampleRrules);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let sample = each_array[$$index];

																			Button($$renderer, {
																				variant: customRrule === sample.value ? "default" : "outline",
																				size: 'sm',
																				onclick: () => customRrule = sample.value,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(sample.label)}`);
																				},
																				$$slots: { default: true }
																			});
																		}

																		$$renderer.push(`<!--]--></div></div>`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> `);

																	if (previewDates().length > 0) {
																		$$renderer.push(`<!--[0--><div class="bg-background rounded-md border p-3">`);

																		Label($$renderer, {
																			class: 'text-muted-foreground text-xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Upcoming Occurrences:`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> <ul class="mt-2 space-y-1 text-sm"><!--[-->`);

																		const each_array_1 = $.ensure_array_like(previewDates());

																		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																			let date = each_array_1[$$index_1];

																			$$renderer.push(`<li class="flex items-center gap-2">`);
																			CalendarIcon($$renderer, { class: 'text-muted-foreground size-3' });
																			$$renderer.push(`<!----> ${$.escape(date)}</li>`);
																		}

																		$$renderer.push(`<!--]--></ul></div>`);
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

										$$renderer.push(` <div class="flex flex-col gap-3">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Affected Monitors`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="rounded-md border p-3">`);

										Label($$renderer, {
											class: 'text-muted-foreground mb-2 block text-xs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select monitors to add:`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto"><!--[-->`);

										const each_array_2 = $.ensure_array_like(availableMonitors);

										for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
											let monitor = each_array_2[$$index_2];

											$$renderer.push(`<div class="flex items-center gap-2">`);

											Checkbox($$renderer, {
												id: `monitor-${$.stringify(monitor.tag)}`,
												checked: selectedMonitorTags().includes(monitor.tag),
												onCheckedChange: () => toggleMonitor(monitor.tag)
											});

											$$renderer.push(`<!----> `);

											Label($$renderer, {
												for: `monitor-${$.stringify(monitor.tag)}`,
												class: 'cursor-pointer text-sm font-normal',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(monitor.name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										}

										$$renderer.push(`<!--]--> `);

										if (availableMonitors.length === 0) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground col-span-2 text-sm">No monitors available</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div></div> `);

										if (selectedMonitors.length > 0) {
											$$renderer.push(`<!--[0--><div class="rounded-md border p-3">`);

											Label($$renderer, {
												class: 'text-muted-foreground mb-2 block text-xs',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Monitor status during maintenance:`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="space-y-2"><!--[-->`);

											const each_array_3 = $.ensure_array_like(selectedMonitors);

											for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
												let selectedMonitor = each_array_3[index];
												const currentStatus = selectedMonitor.status;

												$$renderer.push(`<div class="bg-muted/30 flex items-center justify-between gap-3 rounded border p-2"><span class="text-sm font-medium">${$.escape(getMonitorName(selectedMonitor.tag))}</span> `);

												if (Select.Root) {
													$$renderer.push('<!--[-->');

													Select.Root($$renderer, {
														type: 'single',
														value: currentStatus,
														onValueChange: (value) => {
															if (value) {
																selectedMonitors[index].status = value;
																selectedMonitors = [...selectedMonitors];
															}
														},

														children: ($$renderer) => {
															if (Select.Trigger) {
																$$renderer.push('<!--[-->');

																Select.Trigger($$renderer, {
																	class: 'h-8 w-36 text-xs',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(currentStatus)}`);
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
																				value: 'UP',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->UP`);
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
																				value: 'DOWN',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->DOWN`);
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
																					$$renderer.push(`<!---->DEGRADED`);
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
																				value: 'MAINTENANCE',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->MAINTENANCE`);
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

											$$renderer.push(`<!--]--></div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <p class="text-muted-foreground text-xs">Select monitors and set their status during the maintenance window</p></div> `);

										if (!isNew()) {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Status`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex gap-2">`);

											Button($$renderer, {
												variant: maintenance.status === "ACTIVE" ? "default" : "outline",
												size: 'sm',
												onclick: () => maintenance.status = "ACTIVE",
												children: ($$renderer) => {
													$$renderer.push(`<!---->Active`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												variant: maintenance.status === "INACTIVE" ? "default" : "outline",
												size: 'sm',
												onclick: () => maintenance.status = "INACTIVE",
												children: ($$renderer) => {
													$$renderer.push(`<!---->Inactive`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div></div>`);
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

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-end gap-2',
									children: ($$renderer) => {
										if (!isNew()) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'destructive',
												onclick: deleteMaintenance,
												children: ($$renderer) => {
													TrashIcon($$renderer, { class: 'size-4' });
													$$renderer.push(`<!----> Delete`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											onclick: saveMaintenance,
											disabled: saving || !isValid(),
											children: ($$renderer) => {
												if (saving) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'size-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'size-4' });
												}

												$$renderer.push(`<!--]--> ${$.escape(isNew() ? "Create Maintenance" : "Save Changes")}`);
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
											$$renderer.push(`<div>`);

											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Maintenance Events`);
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
														$$renderer.push(`<!---->Pre-generated maintenance windows for the next 7 days`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
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
											if (loadingEvents) {
												$$renderer.push(`<!--[0--><div class="flex justify-center py-4">`);
												Spinner($$renderer, { class: 'size-6' });
												$$renderer.push(`<!----></div>`);
											} else if (events.length === 0) {
												$$renderer.push(`<!--[1--><p class="text-muted-foreground py-4 text-center text-sm">No events scheduled. Events are generated automatically when maintenance is created or updated.</p>`);
											} else {
												$$renderer.push(`<!--[-1--><div class="space-y-3"><!--[-->`);

												const each_array_4 = $.ensure_array_like(events);

												for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
													let event = each_array_4[$$index_4];
													const displayStatus = getEventDisplayStatus(event);

													$$renderer.push(`<div class="flex items-center justify-between rounded-md border p-4"><div class="flex items-center gap-3"><div class="bg-muted flex size-8 items-center justify-center rounded-full">`);

													if (displayStatus.icon === "play") {
														$$renderer.push('<!--[0-->');
														PlayCircleIcon($$renderer, { class: 'text-primary size-4' });
													} else if (displayStatus.icon === "check") {
														$$renderer.push('<!--[1-->');
														CheckCircleIcon($$renderer, { class: 'text-muted-foreground size-4' });
													} else if (displayStatus.icon === "x") {
														$$renderer.push('<!--[2-->');
														XCircleIcon($$renderer, { class: 'text-muted-foreground size-4' });
													} else {
														$$renderer.push('<!--[-1-->');
														ClockIcon($$renderer, { class: 'text-muted-foreground size-4' });
													}

													$$renderer.push(`<!--]--></div> <div class="space-y-1"><div class="flex items-center gap-2">`);

													Badge($$renderer, {
														variant: displayStatus.variant,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(displayStatus.label)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <p class="text-muted-foreground text-sm">${$.escape(format(new Date(event.start_date_time * 1000), "MMM d, yyyy HH:mm"))}
                        →
                        ${$.escape(format(new Date(event.end_date_time * 1000), "MMM d, yyyy HH:mm"))}</p></div></div> <div class="flex items-center gap-2">`);

													if (event.status === "ONGOING") {
														$$renderer.push('<!--[0-->');

														Button($$renderer, {
															variant: 'outline',
															size: 'sm',
															onclick: () => openEventStatusDialog(event.id, "COMPLETED"),
															children: ($$renderer) => {
																CheckCircleIcon($$renderer, { class: 'size-4' });
																$$renderer.push(`<!----> Complete`);
															},
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (event.status === "SCHEDULED" || event.status === "READY" || event.status === "ONGOING") {
														$$renderer.push('<!--[0-->');

														Button($$renderer, {
															variant: 'outline',
															size: 'sm',
															onclick: () => openEventStatusDialog(event.id, "CANCELLED"),
															children: ($$renderer) => {
																XCircleIcon($$renderer, { class: 'size-4' });
																$$renderer.push(`<!----> Cancel`);
															},
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'icon',
														onclick: () => deleteEvent(event.id),
														children: ($$renderer) => {
															TrashIcon($$renderer, { class: 'size-4' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div></div>`);
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

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return eventStatusDialogOpen;
					},

					set open($$value) {
						eventStatusDialogOpen = $$value;
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
															$$renderer.push(`<!---->${$.escape(eventStatusDialogCopy().title)}`);
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
															$$renderer.push(`<!---->${$.escape(eventStatusDialogCopy().description)}`);
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

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: closeEventStatusDialog,
													disabled: updatingEventStatus,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(eventStatusDialogCopy().cancelLabel)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: eventStatusDialogCopy().confirmVariant,
													onclick: confirmEventStatusUpdate,
													disabled: updatingEventStatus || !pendingEventStatusUpdate,
													children: ($$renderer) => {
														if (updatingEventStatus) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'size-4 animate-spin' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape(eventStatusDialogCopy().confirmLabel)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}