import * as $ from 'svelte/internal/server';
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

export default function ConnectDomain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Reusable connect-a-domain flow. The server-side domain provider (Railway
		// in hosted mode, manual otherwise) attaches the host and returns the DNS
		// records the user must create; we poll until the cert is live. Uniqueness +
		// validation are enforced server-side. Used from the dashboard and the
		// editor's publish dialog.
		let { site, open = false, onconnected } = $$props;

		let new_site_host = '';
		let error = '';
		let connecting = false;
		let domain_status = '';
		let domain_error = '';
		let domain_records = [];
		let copied_dns = null;
		let poll_timer = null;

		// polling: a poll chain is active (guards start_poll re-entry even during the
		// window a tick holds no timer handle). poll_generation: bumped on stop so an
		// in-flight tick knows it's been superseded and must not reschedule.
		let polling = false;

		let poll_generation = 0;

		// The host the shown records/status belong to. Lets us tell "still checking
		// the attached domain" (→ Refresh) from "typed a new domain" (→ Connect).
		let attached_host = '';

		// The user has typed into the input (or is mid-change). Guards the seeding
		// effect below so a reactive `site` update (realtime subscription echo,
		// list invalidation) can't clobber an in-progress entry.
		let dirty = false;

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
		const on_attached_host = $.derived(() => new_site_host.trim().toLowerCase() === attached_host.toLowerCase());

		// Live: attached host is serving. Records collapse behind a toggle.
		const live = $.derived(() => domain_status === 'live' && on_attached_host() && !!attached_host);

		// Errored: the platform failed to issue the cert. A terminal state — the
		// user must fix DNS and re-attach, so surface it instead of spinning.
		const errored = $.derived(() => domain_status === 'error' && on_attached_host() && !!attached_host);

		// Awaiting: attached but not yet live/errored — primary action is re-check,
		// not re-attach (which errors on an already-attached domain). Doesn't require
		// visible records: the platform can report pending/verifying with none yet.
		const awaiting = $.derived(() => !!attached_host && domain_status !== '' && domain_status !== 'live' && domain_status !== 'error' && on_attached_host());

		// Show the attached domain's records only while the input still matches it.
		// Once the user edits the input to switch domains, the old records are stale.
		const show_records = $.derived(() => domain_records.length > 0 && on_attached_host());

		// In the live state the domain shows as read-only text; the editable input is
		// revealed only when the user opts to change it.
		let changing = false;

		// Show the editable input unless we're settled on a live domain and the user
		// hasn't asked to change it.
		const show_input = $.derived(() => !live() || changing);

		// DNS records are shown by default while pending, collapsed once live.
		let records_open = false;

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

			if (!site) return;

			// The submit Button is disabled while connecting, but Enter still fires
			// the form — guard against a duplicate in-flight attach.
			if (connecting) return;

			const host = new_site_host.trim().toLowerCase();

			error = '';

			if (!host) {
				error = 'Enter a domain (e.g. example.com)';

				return;
			}

			// Already attached this host and waiting — a submit (e.g. Enter key) here
			// means "check status", not re-attach (which Railway rejects).
			if (awaiting()) {
				refresh_status();

				return;
			}

			connecting = true;

			try {
				const response = await fetch(endpoint(site.id), {
					method: 'POST',
					headers: auth_headers(true),
					body: JSON.stringify({ host })
				});

				if (!response.ok) {
					const data = await response.json().catch(() => ({}));

					error = data.message || `Failed to connect domain (${response.status})`;

					return;
				}

				const result = await response.json();

				attached_host = host;
				changing = false;

				// The entry is now committed to the server; let the seeding effect
				// track the record again.
				dirty = false;

				apply_status(result);

				// Live immediately (e.g. base-domain subdomain or manual) — close.
				if (domain_status === 'live') {
					open = false;
				} else if (domain_status !== 'error') {
					start_poll(site.id);
				}
			} catch(err) {
				error = err instanceof Error ? err.message : 'Failed to connect domain';
			} finally {
				connecting = false;
			}
		}

		// Apply a /status response to local state and stop polling once the domain
		// has reached a terminal state (live or error). Shared by the manual refresh
		// and the background poll so they can't drift.
		function apply_status(result) {
			domain_status = result.status;
			domain_records = result.records || [];
			domain_error = result.error || '';
			onconnected?.();

			if (domain_status === 'live' || domain_status === 'error') stop_poll();
		}

		// One-shot status check (the "Refresh status" button). The background poll
		// updates on its own timer; this lets the user check immediately.
		async function refresh_status() {
			if (!site) return;

			error = '';
			connecting = true;

			try {
				const response = await fetch(endpoint(site.id, '/status'), { headers: auth_headers() });

				if (response.ok) {
					apply_status(await response.json());
				} else {
					const data = await response.json().catch(() => ({}));

					error = data.message || `Failed to check status (${response.status})`;
				}
			} catch(err) {
				error = err instanceof Error ? err.message : 'Failed to check status';
			} finally {
				connecting = false;
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
						error = ''; // a healthy status clears any stale attach error
						apply_status(await response.json());

						if (domain_status === 'live' || domain_status === 'error') return;
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
				copied_dns = value;
				setTimeout(() => copied_dns = null, 1500);
			} catch(err) {
				console.error('Failed to copy:', err);
			}
		}

		function copy_row($$renderer, label, value) {
			$$renderer.push(`<div class="flex items-center gap-2"><span class="text-muted-foreground shrink-0 w-10">${$.escape(label)}</span> <span class="min-w-0 flex-1 truncate"${$.attr('title', value)}>${$.escape(value)}</span> <button type="button" class="shrink-0 text-muted-foreground hover:text-foreground"${$.attr('aria-label', `Copy ${$.stringify(label)}`)}>`);

			if (copied_dns === value) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { class: 'h-3.5 w-3.5 text-green-500' });
			} else {
				$$renderer.push('<!--[-1-->');
				Copy($$renderer, { class: 'h-3.5 w-3.5 opacity-50 hover:opacity-100' });
			}

			$$renderer.push(`<!--]--></button></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (is_open) => {
						if (!is_open) {
							stop_poll();
							changing = false;
						}
					},

					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: '!w-[min(525px,calc(100vw-1rem))] max-w-none pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">${$.escape(live() && !changing ? 'Domain' : 'Connect a domain')}</h2> <p class="text-muted-foreground text-sm">`);

									if (live() && !changing) {
										$$renderer.push(`<!--[0-->This site is live at your domain.`);
									} else {
										$$renderer.push(`<!--[-1-->Enter the domain you want this site served at. We'll show you the DNS records to add at your registrar.`);
									}

									$$renderer.push(`<!--]--></p> <form class="min-w-0">`);

									if (show_input()) {
										$$renderer.push('<!--[0-->');

										Input($$renderer, {
											oninput: () => dirty = true,
											placeholder: 'example.com',
											class: 'mt-4',
											autocomplete: 'off',
											spellcheck: false,
											get value() {
												return new_site_host;
											},

											set value($$value) {
												new_site_host = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push(`<!--[-1--><div class="mt-4 flex items-center justify-between gap-2 rounded-md border border-input px-3 py-2 min-w-0"><span class="truncate font-medium">${$.escape(attached_host)}</span> <a${$.attr('href', `https://${$.stringify(attached_host)}`)} target="_blank" rel="noopener" class="shrink-0 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">Visit `);
										ExternalLink($$renderer, { class: 'h-3.5 w-3.5' });
										$$renderer.push(`<!----></a></div>`);
									}

									$$renderer.push(`<!--]--> `);

									if (error) {
										$$renderer.push(`<!--[0--><p class="text-red-500 text-sm mt-2">${$.escape(error)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (live()) {
										$$renderer.push(`<!--[0--><div class="mt-3 flex items-center justify-between gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-green-500">`);
										Check($$renderer, { class: 'h-3.5 w-3.5' });
										$$renderer.push(`<!----> Live</span> `);

										if (!changing) {
											$$renderer.push(`<!--[0--><button type="button" class="text-muted-foreground hover:text-foreground">Change domain</button>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
									} else if (errored()) {
										$$renderer.push(`<!--[1--><div class="mt-4 flex items-start gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-red-500">`);
										TriangleAlert($$renderer, { class: 'h-3.5 w-3.5' });
										$$renderer.push(`<!----> Couldn't issue a certificate for this domain.</span></div> `);

										if (domain_error) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs mt-1">${$.escape(domain_error)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <p class="text-muted-foreground text-xs mt-1">Check the DNS records below, then connect again.</p>`);
									} else if (awaiting() || show_records()) {
										$$renderer.push(`<!--[2--><div class="mt-4 flex items-center gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-muted-foreground">`);
										Loader($$renderer, { class: 'h-3.5 w-3.5 animate-spin' });
										$$renderer.push(`<!----> Waiting for DNS &amp; certificate…</span></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (show_records()) {
										$$renderer.push('<!--[0-->');

										if (live()) {
											$$renderer.push(`<!--[0--><button type="button" class="mt-3 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs">`);

											ChevronRight($$renderer, {
												class: `h-3.5 w-3.5 transition-transform ${records_open ? 'rotate-90' : ''}`
											});

											$$renderer.push(`<!----> DNS records</button>`);
										} else {
											$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-xs mt-3 mb-2">Add these records at your DNS provider:</p>`);
										}

										$$renderer.push(`<!--]--> `);

										if (!live() || records_open) {
											$$renderer.push(`<!--[0--><div${$.attr_class(`space-y-2 min-w-0 ${live() ? 'mt-2' : ''}`)}><!--[-->`);

											const each_array = $.ensure_array_like(domain_records);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let record = each_array[$$index];

												$$renderer.push(`<div class="rounded-md bg-[#111] p-3 text-xs font-mono space-y-1.5 min-w-0 overflow-hidden"><div class="flex items-center justify-between gap-2"><span class="text-muted-foreground uppercase">${$.escape(record.type)}</span> `);

												if (record.status === 'valid') {
													$$renderer.push('<!--[0-->');
													Check($$renderer, { class: 'h-3.5 w-3.5 text-green-500' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div> `);
												copy_row($$renderer, 'Name', record.host);
												$$renderer.push(`<!----> `);
												copy_row($$renderer, 'Value', record.value);
												$$renderer.push(`<!----></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'mt-4',
											children: ($$renderer) => {
												if (changing && on_attached_host()) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														type: 'button',
														variant: 'outline',
														onclick: () => {
															changing = false;
															dirty = false;
															new_site_host = attached_host;
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');

													Button($$renderer, {
														type: 'button',
														variant: live() ? 'default' : 'outline',
														onclick: () => open = false,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(show_records() || live() ? 'Done' : 'Cancel')}`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]--> `);

												if (awaiting()) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														type: 'button',
														disabled: connecting,
														onclick: refresh_status,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(connecting ? 'Checking…' : 'Refresh status')}`);
														},
														$$slots: { default: true }
													});
												} else if (!live()) {
													$$renderer.push('<!--[1-->');

													Button($$renderer, {
														type: 'submit',
														disabled: connecting,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(connecting ? 'Connecting…' : 'Connect')}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}