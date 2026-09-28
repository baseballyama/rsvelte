import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';

import {
	Copy,
	Check,
	Loader,
	ChevronRight,
	ExternalLink,
	TriangleAlert
} from 'lucide-svelte';

import { onDestroy } from 'svelte';
import { self } from '$lib/pocketbase/managers';
import { is_host_assigned } from '$lib/site_host';

var root = $.from_html(`<div class="flex items-center gap-2"><span class="text-muted-foreground shrink-0 w-10"> </span> <span class="min-w-0 flex-1 truncate"> </span> <button type="button" class="shrink-0 text-muted-foreground hover:text-foreground"><!></button></div>`);
var root_1 = $.from_html(`<div class="mt-4 flex items-center justify-between gap-2 rounded-md border border-input px-3 py-2 min-w-0"><span class="truncate font-medium"> </span> <a target="_blank" rel="noopener" class="shrink-0 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">Visit <!></a></div>`);
var root_2 = $.from_html(`<p class="text-red-500 text-sm mt-2"> </p>`);
var root_3 = $.from_html(`<button type="button" class="text-muted-foreground hover:text-foreground">Change domain</button>`);
var root_4 = $.from_html(`<div class="mt-3 flex items-center justify-between gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-green-500"><!> Live</span> <!></div>`);
var root_5 = $.from_html(`<p class="text-muted-foreground text-xs mt-1"> </p>`);
var root_6 = $.from_html(`<div class="mt-4 flex items-start gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-red-500"><!> Couldn't issue a certificate for this domain.</span></div> <!> <p class="text-muted-foreground text-xs mt-1">Check the DNS records below, then connect again.</p>`, 1);
var root_7 = $.from_html(`<div class="mt-4 flex items-center gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-muted-foreground"><!> Waiting for DNS &amp; certificate…</span></div>`);
var root_8 = $.from_html(`<button type="button" class="mt-3 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"><!> DNS records</button>`);
var root_9 = $.from_html(`<p class="text-muted-foreground text-xs mt-3 mb-2">Add these records at your DNS provider:</p>`);
var root_10 = $.from_html(`<div class="rounded-md bg-[#111] p-3 text-xs font-mono space-y-1.5 min-w-0 overflow-hidden"><div class="flex items-center justify-between gap-2"><span class="text-muted-foreground uppercase"> </span> <!></div> <!> <!></div>`);
var root_11 = $.from_html(`<div></div>`);
var root_12 = $.from_html(`<!> <!>`, 1);
var root_13 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight"> </h2> <p class="text-muted-foreground text-sm"><!></p> <form class="min-w-0"><!> <!> <!> <!> <!></form>`, 1);

export default function ConnectDomain($$anchor, $$props) {
	$.push($$props, true);

	const // Reusable connect-a-domain flow. The server-side domain provider (Railway
	// in hosted mode, manual otherwise) attaches the host and returns the DNS
	// records the user must create; we poll until the cert is live. Uniqueness +
	// validation are enforced server-side. Used from the dashboard and the
	// editor's publish dialog.
	// polling: a poll chain is active (guards start_poll re-entry even during the
	// window a tick holds no timer handle). poll_generation: bumped on stop so an
	// in-flight tick knows it's been superseded and must not reschedule.
	// The host the shown records/status belong to. Lets us tell "still checking
	// the attached domain" (→ Refresh) from "typed a new domain" (→ Connect).
	// The user has typed into the input (or is mid-change). Guards the seeding
	// effect below so a reactive `site` update (realtime subscription echo,
	// list invalidation) can't clobber an in-progress entry.
	// Seed local state from the site record. Reads the reactive `site` prop, so
	// it re-runs whenever that record changes — hence the `dirty` guard on the
	// input-bound field, and the auto-poll for a domain that's already pending
	// (e.g. reopening the dialog on a site attached in a prior session).
	// Both call sites mount this component unconditionally, so only seed
	// state and poll while the dialog is actually open — otherwise every
	// site with a pending domain would poll (and pb.Save) in the background
	// forever, and reactive site updates would clobber state off-screen.
	// A domain that's attached but not yet live needs the poll running to
	// advance to live on its own — otherwise reopening shows a spinner that
	// never resolves without a manual refresh.
	// The entered host matches the attached one (vs. the user typing a new
	// domain to switch to).
	// Live: attached host is serving. Records collapse behind a toggle.
	// Errored: the platform failed to issue the cert. A terminal state — the
	// user must fix DNS and re-attach, so surface it instead of spinning.
	// Awaiting: attached but not yet live/errored — primary action is re-check,
	// not re-attach (which errors on an already-attached domain). Doesn't require
	// visible records: the platform can report pending/verifying with none yet.
	// Show the attached domain's records only while the input still matches it.
	// Once the user edits the input to switch domains, the old records are stale.
	// In the live state the domain shows as read-only text; the editable input is
	// revealed only when the user opts to change it.
	// Show the editable input unless we're settled on a live domain and the user
	// hasn't asked to change it.
	// DNS records are shown by default while pending, collapsed once live.
	// The submit Button is disabled while connecting, but Enter still fires
	// the form — guard against a duplicate in-flight attach.
	// Already attached this host and waiting — a submit (e.g. Enter key) here
	// means "check status", not re-attach (which Railway rejects).
	// The entry is now committed to the server; let the seeding effect
	// track the record again.
	// Live immediately (e.g. base-domain subdomain or manual) — close.
	// Apply a /status response to local state and stop polling once the domain
	// has reached a terminal state (live or error). Shared by the manual refresh
	// and the background poll so they can't drift.
	// One-shot status check (the "Refresh status" button). The background poll
	// updates on its own timer; this lets the user check immediately.
	// Idempotent: the seeding effect may re-run on reactive site changes, and
	// we don't want to stack timers or reset the countdown each time. Track a
	// generation so an in-flight tick (which holds no timer handle during its
	// await) can tell whether it's still the active poll before rescheduling —
	// otherwise a re-entrant start_poll could spawn a second, untracked chain.
	// a healthy status clears any stale attach error
	// transient — keep polling
	// stop_poll() (or a newer start) may have superseded us mid-fetch.
	// invalidate any in-flight tick so it won't reschedule
	// The dialog's onOpenChange only fires on interactive close, not on unmount
	// (the editor tears down this subtree on session expiry / site change). Stop
	// the self-rescheduling poll on destroy so it can't leak forever.
	copy_row = ($$anchor, label = $.noop, value = $.noop) => {
		var div = root();
		var span = $.child(div);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);
		var button = $.sibling(span_1, 2);
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				Check($$anchor, { class: 'h-3.5 w-3.5 text-green-500' });
			};

			var alternate = ($$anchor) => {
				Copy($$anchor, { class: 'h-3.5 w-3.5 opacity-50 hover:opacity-100' });
			};

			$.if(node, ($$render) => {
				if ($.get(copied_dns) === value()) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(button);
		$.reset(div);

		$.template_effect(() => {
			$.set_text(text, label());
			$.set_attribute(span_1, 'title', value());
			$.set_text(text_1, value());
			$.set_attribute(button, 'aria-label', `Copy ${label() ?? ''}`);
		});

		$.delegated('click', button, () => copy_dns(value()));
		$.append($$anchor, div);
	};

	let open = $.prop($$props, 'open', 15, false);
	let new_site_host = $.state('');
	let error = $.state('');
	let connecting = $.state(false);
	let domain_status = $.state('');
	let domain_error = $.state('');
	let domain_records = $.state($.proxy([]));
	let copied_dns = $.state(null);
	let poll_timer = null;
	let polling = false;
	let poll_generation = 0;
	let attached_host = $.state('');
	let dirty = $.state(false);

	$.user_effect(() => {
		// Both call sites mount this component unconditionally, so only seed
		// state and poll while the dialog is actually open — otherwise every
		// site with a pending domain would poll (and pb.Save) in the background
		// forever, and reactive site updates would clobber state off-screen.
		if (!open()) {
			stop_poll();

			return;
		}

		if (!$$props.site) return;

		const assigned = is_host_assigned($$props.site) ? $$props.site.host : '';

		if (!$.get(dirty)) {
			$.set(new_site_host, assigned, true);
		}

		$.set(attached_host, assigned, true);
		$.set(domain_status, $$props.site.domain_status || '', true);
		$.set(domain_error, $$props.site.domain_error || '', true);
		$.set(domain_records, parse_dns_records($$props.site.domain_dns_records), true);

		// A domain that's attached but not yet live needs the poll running to
		// advance to live on its own — otherwise reopening shows a spinner that
		// never resolves without a manual refresh.
		if (assigned && $.get(domain_status) && $.get(domain_status) !== 'live' && $.get(domain_status) !== 'error') {
			start_poll($$props.site.id);
		}
	});

	// The entered host matches the attached one (vs. the user typing a new
	// domain to switch to).
	const on_attached_host = $.derived(() => $.get(new_site_host).trim().toLowerCase() === $.get(attached_host).toLowerCase());

	// Live: attached host is serving. Records collapse behind a toggle.
	const live = $.derived(() => $.get(domain_status) === 'live' && $.get(on_attached_host) && !!$.get(attached_host));

	// Errored: the platform failed to issue the cert. A terminal state — the
	// user must fix DNS and re-attach, so surface it instead of spinning.
	const errored = $.derived(() => $.get(domain_status) === 'error' && $.get(on_attached_host) && !!$.get(attached_host));

	// Awaiting: attached but not yet live/errored — primary action is re-check,
	// not re-attach (which errors on an already-attached domain). Doesn't require
	// visible records: the platform can report pending/verifying with none yet.
	const awaiting = $.derived(() => !!$.get(attached_host) && $.get(domain_status) !== '' && $.get(domain_status) !== 'live' && $.get(domain_status) !== 'error' && $.get(on_attached_host));

	// Show the attached domain's records only while the input still matches it.
	// Once the user edits the input to switch domains, the old records are stale.
	const show_records = $.derived(() => $.get(domain_records).length > 0 && $.get(on_attached_host));

	// In the live state the domain shows as read-only text; the editable input is
	// revealed only when the user opts to change it.
	let changing = $.state(false);

	// Show the editable input unless we're settled on a live domain and the user
	// hasn't asked to change it.
	const show_input = $.derived(() => !$.get(live) || $.get(changing));

	// DNS records are shown by default while pending, collapsed once live.
	let records_open = $.state(false);

	function parse_dns_records(raw) {
		if (!raw) return [];

		try {
			const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	function endpoint(site_id, path = '') {
		return `${self.instance?.baseURL}/api/primo/sites/${site_id}/domain${path}`;
	}

	function auth_headers(json = false) {
		const headers = {};

		if (self.instance?.authStore.token) headers['Authorization'] = `Bearer ${self.instance.authStore.token}`;
		if (json) headers['Content-Type'] = 'application/json';

		return headers;
	}

	async function handle_connect(event) {
		event.preventDefault();

		if (!$$props.site) return;

		// The submit Button is disabled while connecting, but Enter still fires
		// the form — guard against a duplicate in-flight attach.
		if ($.get(connecting)) return;

		const host = $.get(new_site_host).trim().toLowerCase();

		$.set(error, '');

		if (!host) {
			$.set(error, 'Enter a domain (e.g. example.com)');

			return;
		}

		// Already attached this host and waiting — a submit (e.g. Enter key) here
		// means "check status", not re-attach (which Railway rejects).
		if ($.get(awaiting)) {
			refresh_status();

			return;
		}

		$.set(connecting, true);

		try {
			const response = await fetch(endpoint($$props.site.id), {
				method: 'POST',
				headers: auth_headers(true),
				body: JSON.stringify({ host })
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));

				$.set(error, data.message || `Failed to connect domain (${response.status})`, true);

				return;
			}

			const result = await response.json();

			$.set(attached_host, host, true);
			$.set(changing, false);

			// The entry is now committed to the server; let the seeding effect
			// track the record again.
			$.set(dirty, false);

			apply_status(result);

			// Live immediately (e.g. base-domain subdomain or manual) — close.
			if ($.get(domain_status) === 'live') {
				open(false);
			} else if ($.get(domain_status) !== 'error') {
				start_poll($$props.site.id);
			}
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Failed to connect domain', true);
		} finally {
			$.set(connecting, false);
		}
	}

	// Apply a /status response to local state and stop polling once the domain
	// has reached a terminal state (live or error). Shared by the manual refresh
	// and the background poll so they can't drift.
	function apply_status(result) {
		$.set(domain_status, result.status, true);
		$.set(domain_records, result.records || [], true);
		$.set(domain_error, result.error || '', true);
		$$props.onconnected?.();

		if ($.get(domain_status) === 'live' || $.get(domain_status) === 'error') stop_poll();
	}

	// One-shot status check (the "Refresh status" button). The background poll
	// updates on its own timer; this lets the user check immediately.
	async function refresh_status() {
		if (!$$props.site) return;

		$.set(error, '');
		$.set(connecting, true);

		try {
			const response = await fetch(endpoint($$props.site.id, '/status'), { headers: auth_headers() });

			if (response.ok) {
				apply_status(await response.json());
			} else {
				const data = await response.json().catch(() => ({}));

				$.set(error, data.message || `Failed to check status (${response.status})`, true);
			}
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Failed to check status', true);
		} finally {
			$.set(connecting, false);
		}
	}

	function start_poll(site_id) {
		// Idempotent: the seeding effect may re-run on reactive site changes, and
		// we don't want to stack timers or reset the countdown each time. Track a
		// generation so an in-flight tick (which holds no timer handle during its
		// await) can tell whether it's still the active poll before rescheduling —
		// otherwise a re-entrant start_poll could spawn a second, untracked chain.
		if (polling) return;

		polling = true;

		const generation = ++poll_generation;

		const tick = async () => {
			try {
				const response = await fetch(endpoint(site_id, '/status'), { headers: auth_headers() });

				if (response.ok) {
					$.set(error, '' // a healthy status clears any stale attach error
					);
					apply_status(await response.json());

					if ($.get(domain_status) === 'live' || $.get(domain_status) === 'error') return;
				}
			} catch {
				// transient — keep polling
			}

			// stop_poll() (or a newer start) may have superseded us mid-fetch.
			if (generation !== poll_generation) return;

			poll_timer = setTimeout(tick, 30000);
		};

		poll_timer = setTimeout(tick, 30000);
	}

	function stop_poll() {
		if (poll_timer) clearTimeout(poll_timer);

		poll_timer = null;
		polling = false;
		poll_generation++; // invalidate any in-flight tick so it won't reschedule
	}

	// The dialog's onOpenChange only fires on interactive close, not on unmount
	// (the editor tears down this subtree on session expiry / site change). Stop
	// the self-rescheduling poll on destroy so it can't leak forever.
	onDestroy(stop_poll);

	async function copy_dns(value) {
		try {
			await navigator.clipboard.writeText(value);
			$.set(copied_dns, value, true);
			setTimeout(() => $.set(copied_dns, null), 1500);
		} catch(err) {
			console.error('Failed to copy:', err);
		}
	}

	var fragment_2 = $.comment();
	var node_1 = $.first_child(fragment_2);

	$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			onOpenChange: (is_open) => {
				if (!is_open) {
					stop_poll();
					$.set(changing, false);
				}
			},

			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: '!w-[min(525px,calc(100vw-1rem))] max-w-none pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_13();
							var h2 = $.first_child(fragment_4);
							var text_2 = $.only_child(h2, true);
							var p = $.sibling(h2, 2);
							var node_3 = $.child(p);

							{
								var consequent_1 = ($$anchor) => {
									var text_3 = $.text('This site is live at your domain.');

									$.append($$anchor, text_3);
								};

								var alternate_1 = ($$anchor) => {
									var text_4 = $.text('Enter the domain you want this site served at. We\'ll show you the DNS records to add at your registrar.');

									$.append($$anchor, text_4);
								};

								$.if(node_3, ($$render) => {
									if ($.get(live) && !$.get(changing)) $$render(consequent_1); else $$render(alternate_1, -1);
								});
							}

							$.reset(p);

							var form = $.sibling(p, 2);
							var node_4 = $.child(form);

							{
								var consequent_2 = ($$anchor) => {
									Input($$anchor, {
										oninput: () => $.set(dirty, true),
										placeholder: 'example.com',
										class: 'mt-4',
										autocomplete: 'off',
										spellcheck: false,
										get value() {
											return $.get(new_site_host);
										},

										set value($$value) {
											$.set(new_site_host, $$value, true);
										}
									});
								};

								var alternate_2 = ($$anchor) => {
									var div_1 = root_1();
									var span_2 = $.child(div_1);
									var text_5 = $.only_child(span_2, true);
									var a = $.sibling(span_2, 2);
									var node_5 = $.sibling($.child(a));

									ExternalLink(node_5, { class: 'h-3.5 w-3.5' });
									$.reset(a);
									$.reset(div_1);

									$.template_effect(() => {
										$.set_text(text_5, $.get(attached_host));
										$.set_attribute(a, 'href', `https://${$.get(attached_host) ?? ''}`);
									});

									$.append($$anchor, div_1);
								};

								$.if(node_4, ($$render) => {
									if ($.get(show_input)) $$render(consequent_2); else $$render(alternate_2, -1);
								});
							}

							var node_6 = $.sibling(node_4, 2);

							{
								var consequent_3 = ($$anchor) => {
									var p_1 = root_2();
									var text_6 = $.only_child(p_1, true);

									$.template_effect(() => $.set_text(text_6, $.get(error)));
									$.append($$anchor, p_1);
								};

								$.if(node_6, ($$render) => {
									if ($.get(error)) $$render(consequent_3);
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_2 = root_4();
									var span_3 = $.child(div_2);
									var node_8 = $.child(span_3);

									Check(node_8, { class: 'h-3.5 w-3.5' });
									$.next();
									$.reset(span_3);

									var node_9 = $.sibling(span_3, 2);

									{
										var consequent_4 = ($$anchor) => {
											var button_1 = root_3();

											$.delegated('click', button_1, () => {
												$.set(changing, true);
												$.set(dirty, true);
											});

											$.append($$anchor, button_1);
										};

										$.if(node_9, ($$render) => {
											if (!$.get(changing)) $$render(consequent_4);
										});
									}

									$.reset(div_2);
									$.append($$anchor, div_2);
								};

								var consequent_7 = ($$anchor) => {
									var fragment_6 = root_6();
									var div_3 = $.first_child(fragment_6);
									var span_4 = $.child(div_3);
									var node_10 = $.child(span_4);

									TriangleAlert(node_10, { class: 'h-3.5 w-3.5' });
									$.next();
									$.reset(span_4);
									$.reset(div_3);

									var node_11 = $.sibling(div_3, 2);

									{
										var consequent_6 = ($$anchor) => {
											var p_2 = root_5();
											var text_7 = $.only_child(p_2, true);

											$.template_effect(() => $.set_text(text_7, $.get(domain_error)));
											$.append($$anchor, p_2);
										};

										$.if(node_11, ($$render) => {
											if ($.get(domain_error)) $$render(consequent_6);
										});
									}

									$.next(2);
									$.append($$anchor, fragment_6);
								};

								var consequent_8 = ($$anchor) => {
									var div_4 = root_7();
									var span_5 = $.child(div_4);
									var node_12 = $.child(span_5);

									Loader(node_12, { class: 'h-3.5 w-3.5 animate-spin' });
									$.next();
									$.reset(span_5);
									$.reset(div_4);
									$.append($$anchor, div_4);
								};

								$.if(node_7, ($$render) => {
									if ($.get(live)) $$render(consequent_5); else if ($.get(errored)) $$render(consequent_7, 1); else if ($.get(awaiting) || $.get(show_records)) $$render(consequent_8, 2);
								});
							}

							var node_13 = $.sibling(node_7, 2);

							{
								var consequent_12 = ($$anchor) => {
									var fragment_7 = root_12();
									var node_14 = $.first_child(fragment_7);

									{
										var consequent_9 = ($$anchor) => {
											var button_2 = root_8();
											var node_15 = $.child(button_2);

											{
												let $0 = $.derived(() => $.get(records_open) ? 'rotate-90' : '');

												ChevronRight(node_15, {
													get class() {
														return `h-3.5 w-3.5 transition-transform ${$.get($0) ?? ''}`;
													}
												});
											}

											$.next();
											$.reset(button_2);
											$.delegated('click', button_2, () => $.set(records_open, !$.get(records_open)));
											$.append($$anchor, button_2);
										};

										var alternate_3 = ($$anchor) => {
											var p_3 = root_9();

											$.append($$anchor, p_3);
										};

										$.if(node_14, ($$render) => {
											if ($.get(live)) $$render(consequent_9); else $$render(alternate_3, -1);
										});
									}

									var node_16 = $.sibling(node_14, 2);

									{
										var consequent_11 = ($$anchor) => {
											var div_5 = root_11();

											$.each(div_5, 21, () => $.get(domain_records), $.index, ($$anchor, record) => {
												var div_6 = root_10();
												var div_7 = $.child(div_6);
												var span_6 = $.child(div_7);
												var text_8 = $.only_child(span_6, true);
												var node_17 = $.sibling(span_6, 2);

												{
													var consequent_10 = ($$anchor) => {
														Check($$anchor, { class: 'h-3.5 w-3.5 text-green-500' });
													};

													$.if(node_17, ($$render) => {
														if ($.get(record).status === 'valid') $$render(consequent_10);
													});
												}

												$.reset(div_7);

												var node_18 = $.sibling(div_7, 2);

												copy_row(node_18, () => 'Name', () => $.get(record).host);

												var node_19 = $.sibling(node_18, 2);

												copy_row(node_19, () => 'Value', () => $.get(record).value);
												$.reset(div_6);
												$.template_effect(() => $.set_text(text_8, $.get(record).type));
												$.append($$anchor, div_6);
											});

											$.reset(div_5);
											$.template_effect(() => $.set_class(div_5, 1, `space-y-2 min-w-0 ${$.get(live) ? 'mt-2' : ''}`));
											$.append($$anchor, div_5);
										};

										$.if(node_16, ($$render) => {
											if (!$.get(live) || $.get(records_open)) $$render(consequent_11);
										});
									}

									$.append($$anchor, fragment_7);
								};

								$.if(node_13, ($$render) => {
									if ($.get(show_records)) $$render(consequent_12);
								});
							}

							var node_20 = $.sibling(node_13, 2);

							$.component(node_20, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'mt-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_12();
										var node_21 = $.first_child(fragment_9);

										{
											var consequent_13 = ($$anchor) => {
												Button($$anchor, {
													type: 'button',
													variant: 'outline',
													onclick: () => {
														$.set(changing, false);
														$.set(dirty, false);
														$.set(new_site_host, $.get(attached_host), true);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Cancel');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											};

											var alternate_4 = ($$anchor) => {
												{
													let $0 = $.derived(() => $.get(live) ? 'default' : 'outline');

													Button($$anchor, {
														type: 'button',
														get variant() {
															return $.get($0);
														},
														onclick: () => open(false),
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text();

															$.template_effect(() => $.set_text(text_10, $.get(show_records) || $.get(live) ? 'Done' : 'Cancel'));
															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												}
											};

											$.if(node_21, ($$render) => {
												if ($.get(changing) && $.get(on_attached_host)) $$render(consequent_13); else $$render(alternate_4, -1);
											});
										}

										var node_22 = $.sibling(node_21, 2);

										{
											var consequent_14 = ($$anchor) => {
												Button($$anchor, {
													type: 'button',
													get disabled() {
														return $.get(connecting);
													},
													onclick: refresh_status,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text();

														$.template_effect(() => $.set_text(text_11, $.get(connecting) ? 'Checking…' : 'Refresh status'));
														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});
											};

											var consequent_15 = ($$anchor) => {
												Button($$anchor, {
													type: 'submit',
													get disabled() {
														return $.get(connecting);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_12 = $.text();

														$.template_effect(() => $.set_text(text_12, $.get(connecting) ? 'Connecting…' : 'Connect'));
														$.append($$anchor, text_12);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_22, ($$render) => {
												if ($.get(awaiting)) $$render(consequent_14); else if (!$.get(live)) $$render(consequent_15, 1);
											});
										}

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.template_effect(() => $.set_text(text_2, $.get(live) && !$.get(changing) ? 'Domain' : 'Connect a domain'));
							$.event('submit', form, handle_connect);
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

	$.append($$anchor, fragment_2);
	$.pop();
}

$.delegate(['click']);