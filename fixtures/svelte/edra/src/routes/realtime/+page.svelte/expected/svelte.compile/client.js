import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { createEditor, Edra } from '$lib/edra/shadcn/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { ArrowLeft, BookOpen, Pencil, Radio, Shuffle, Users } from '@lucide/svelte';
import { cn, getRandomColor, getRandomName } from '$lib/utils.js';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { browser } from '$app/environment';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import './page.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Doc } from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { PUBLIC_REALTIME_URL } from '$env/static/public';

const avatar = ($$anchor, name = $.noop, color = $.noop, variant = $.noop) => {
	const classes = $.derived(() => variant() === 'button'
		? 'size-5 text-[11px] leading-none'
		: variant() === 'trigger'
			? 'size-6 text-[10px] leading-none border-2 border-background shadow-sm'
			: variant() === 'list'
				? 'size-8 shrink-0 text-xs shadow-sm'
				: 'size-10 shrink-0 text-sm shadow-sm');

	var span = root();
	let styles;
	var text = $.only_child(span, true);

	$.template_effect(
		($0, $1) => {
			$.set_class(span, 1, $0);
			$.set_attribute(span, 'title', name());
			styles = $.set_style(span, '', styles, { 'background-color': color() });
			$.set_text(text, $1);
		},
		[
			() => $.clsx(cn('grid place-items-center rounded-md font-bold text-white', $.get(classes))),
			() => (name() || '?').charAt(0).toUpperCase()
		]
	);

	$.append($$anchor, span);
};

var root = $.from_html(`<span aria-hidden="true"> </span>`);
var root_1 = $.from_html(`<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span> <span class="relative inline-flex size-2 rounded-full bg-emerald-500"></span>`, 1);
var root_2 = $.from_html(`<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span> <span class="relative inline-flex size-2 rounded-full bg-amber-500"></span>`, 1);
var root_3 = $.from_html(`<span class="relative inline-flex size-2 rounded-full bg-destructive"></span>`);
var root_4 = $.from_html(`<span class="grid size-6 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground"> </span>`);
var root_5 = $.from_html(`<span class="hidden items-center -space-x-1.5 sm:flex"><!> <!></span> <span class="inline-flex items-center gap-1"><!> <span class="tabular-nums"> </span></span>`, 1);
var root_6 = $.from_html(`<span class="capitalize"> </span>`);
var root_7 = $.from_html(`<span class="relative flex size-2 shrink-0"><!></span> <!>`, 1);
var root_8 = $.from_html(`<span class="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary">You</span>`);
var root_9 = $.from_html(`<li class="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"><!> <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="truncate text-sm leading-none font-medium"> </span> <!></div> <span class="flex items-center gap-1 text-[11px] text-muted-foreground"><span class="size-1 rounded-full bg-emerald-500"></span> Active now</span></div></li>`);
var root_10 = $.from_html(`<ul class="space-y-0.5"></ul>`);
var root_11 = $.from_html(`<p class="px-2 py-6 text-center text-xs text-muted-foreground">No collaborators yet.<br/>Share this page to invite others.</p>`);
var root_12 = $.from_html(`<div class="flex items-center justify-between border-b px-3 py-2.5"><div class="flex items-center gap-2"><span></span> <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase"> </span> <span class="text-xs text-muted-foreground">·</span> <span class="text-xs font-medium tabular-nums"> </span></div> <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"></span></div> <div class="max-h-72 overflow-y-auto p-2"><!></div> <div class="border-t bg-muted/30 px-3 py-2"><p class="text-[11px] leading-snug text-muted-foreground">Cursors and selections are shown in real time. Changes sync automatically.</p></div>`, 1);
var root_13 = $.from_html(`<!> <!>`, 1);
var root_14 = $.from_html(`<!> Docs`, 1);
var root_15 = $.from_html(`<!> <span class="hidden max-w-24 truncate text-xs font-medium sm:inline"> </span> <!>`, 1);
var root_16 = $.from_html(`<!> <div class="grid gap-4 py-2"><div class="flex items-center gap-3"><!> <div class="min-w-0 flex-1"><span class="block truncate text-sm font-medium"> </span> <span class="text-xs text-muted-foreground">Visible to everyone in this room</span></div> <!></div> <div class="grid gap-2"><label for="collab-name" class="text-sm font-medium">Display name</label> <!> <p class="text-xs text-muted-foreground tabular-nums"> </p></div></div> <!>`, 1);
var root_17 = $.from_html(`<div><span></span> <span class="font-medium"> </span> <span class="hidden text-muted-foreground sm:inline">·</span> <span class="hidden text-muted-foreground sm:inline">Edits will sync when back online.</span></div>`);
var root_18 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_19 = $.from_html(`<div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-8"><!> <!> <!> <!> <!> <!></div>`);
var root_20 = $.from_html(`<div class="flex min-h-screen flex-col bg-background text-foreground"><header class="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-4 md:px-6"><div class="flex min-w-0 items-center gap-2 sm:gap-3"><!> <div class="flex min-w-0 items-center gap-2"><span class="truncate text-sm font-semibold tracking-tight">Realtime</span> <span class="hidden items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-flex"><!> <span class="truncate"></span></span></div></div> <div class="flex shrink-0 items-center gap-1.5 sm:gap-2"><!> <!> <!> <!> <!></div></header> <!> <!> <h3 class="animate-pulse py-4 text-center">Changes are streamed in real time.</h3> <main class="flex-1 overflow-y-auto pb-24 sm:pb-32"><!></main></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const USER_STORAGE_KEY = 'edra-realtime-user';
	const ROOM_NAME = 'edra:demoroom';

	function loadStoredUser() {
		try {
			const raw = localStorage.getItem(USER_STORAGE_KEY);

			if (!raw) return null;

			const parsed = JSON.parse(raw);

			if (typeof parsed.name === 'string' && parsed.name.trim() && typeof parsed.color === 'string') {
				return { name: parsed.name.trim().slice(0, 32), color: parsed.color };
			}
		} catch {
			// ignore
		}

		return null;
	}

	function persistUser(user) {
		localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
	}

	function getInitialUser() {
		if (browser) {
			const stored = loadStoredUser();

			if (stored) return stored;
		}

		return { name: getRandomName(), color: getRandomColor() };
	}

	async function sampleCallAI(_prompt, onChunk, onError) {
		const paragraph = 'The quick brown fox jumps over the lazy dog. ' + 'This is a sample paragraph generated for testing purposes. ' + 'It demonstrates how the AI streaming interface works by delivering content word by word. ' + 'Each word arrives with a small delay to simulate real-time generation from an AI model.';
		const words = paragraph.split(' ');

		try {
			for (const word of words) {
				await new Promise((r) => setTimeout(r, 100));
				onChunk(word + ' ');
			}
		} catch(error) {
			onError(error instanceof Error ? error : new Error(String(error)));
		}
	}

	let editor = $.state(void 0);
	let provider;
	let ydoc;
	let userDialogOpen = $.state(false);
	let pendingName = $.state('');
	let pendingColor = $.state('');
	const initialUser = getInitialUser();
	let currentUser = $.state($.proxy(initialUser));
	let status = $.state('connecting');
	let activeUsers = $.state($.proxy([]));

	// --- presence sync (rAF-throttled, awareness can fire >60Hz) ---
	let raf = 0;

	let onStatusHandler;
	let onSyncHandler;
	let onAwarenessHandler;

	function scheduleUpdate() {
		if (raf) return;

		raf = requestAnimationFrame(() => {
			raf = 0;
			syncUsers();
		});
	}

	function syncUsers() {
		if (!provider?.awareness) {
			const fallback = $.get(status) === 'connected' ? [{ ...$.get(currentUser), clientId: 0 }] : [];

			if (fallback.length !== $.get(activeUsers).length) $.set(activeUsers, fallback, true);

			return;
		}

		const selfId = provider.awareness.clientID;
		const states = provider.awareness.getStates();
		const list = [];

		states.forEach((st, clientId) => {
			const user = st?.user;

			if (user?.name) {
				list.push({
					name: String(user.name).slice(0, 32),
					color: user.color || '#7C3AED',
					clientId
				});
			}
		});

		if ($.get(status) === 'connected' && !list.some((u) => u.clientId === selfId)) {
			list.push({ ...$.get(currentUser), clientId: selfId });
		}

		list.sort((a, b) => {
			if (a.clientId === selfId) return -1;
			if (b.clientId === selfId) return 1;

			return a.name.localeCompare(b.name);
		});

		if (list.length === $.get(activeUsers).length && list.every((u, i) => u.clientId === $.get(activeUsers)[i]?.clientId && u.name === $.get(activeUsers)[i]?.name && u.color === $.get(activeUsers)[i]?.color)) {
			return;
		}

		$.set(activeUsers, list, true);
	}

	const userCount = $.derived(() => $.get(activeUsers).length || ($.get(status) === 'connected' ? 1 : 0));
	const visibleUsers = $.derived(() => $.get(activeUsers).slice(0, 4));
	const overflowCount = $.derived(() => Math.max(0, $.get(activeUsers).length - 4));

	const statusLabel = $.derived(() => $.get(status) === 'connected'
		? 'Live'
		: $.get(status) === 'connecting' ? 'Connecting' : 'Offline');

	function openUserDialog() {
		$.set(pendingName, $.get(currentUser).name, true);
		$.set(pendingColor, $.get(currentUser).color, true);
		$.set(userDialogOpen, true);
	}

	function shufflePendingColor() {
		$.set(pendingColor, getRandomColor(), true);
	}

	function saveUser() {
		const name = $.get(pendingName).trim().slice(0, 32);

		if (!name) return;

		const next = { name, color: $.get(pendingColor) };

		$.set(currentUser, next, true);
		persistUser(next);

		if ($.get(editor)) {
			$.get(editor).commands.updateUser(next);
		}

		scheduleUpdate();
		$.set(userDialogOpen, false);
	}

	if (browser) {
		ydoc = new Doc();
		provider = new HocuspocusProvider({ url: PUBLIC_REALTIME_URL, name: ROOM_NAME, document: ydoc });

		onStatusHandler = (e) => {
			$.set(status, e.status, true);
			scheduleUpdate();
		};

		onSyncHandler = () => scheduleUpdate();
		onAwarenessHandler = () => scheduleUpdate();
		provider.on('status', onStatusHandler);
		provider.on('synced', onSyncHandler);
		provider.on('connect', onSyncHandler);

		provider.on('disconnect', () => {
			$.set(status, 'disconnected');
			scheduleUpdate();
		});

		provider.awareness?.on('update', onAwarenessHandler);

		$.set(editor, createEditor({
			collaborative: true,
			callAI: sampleCallAI,
			extensions: [
				Collaboration.configure({ document: ydoc }),
				CollaborationCaret.configure({ provider, user: initialUser })
			]
		}));
	}

	$.user_effect(() => {
		return () => {
			if (raf) cancelAnimationFrame(raf);

			try {
				if (provider && onStatusHandler) provider.off('status', onStatusHandler);

				if (provider && onSyncHandler) {
					provider.off('synced', onSyncHandler);
					provider.off('connect', onSyncHandler);
				}

				if (provider?.awareness && onAwarenessHandler) {
					provider.awareness.off('update', onAwarenessHandler);
				}
			} catch {
				// ignore
			}

			$.get(editor)?.destroy();
			provider?.destroy();
			ydoc?.destroy();
		};
	});

	var div = root_20();

	$.head('16wt24y', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Realtime Workspace | Edra';
		});
	});

	var header = $.child(div);
	var div_1 = $.child(header);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => resolve('/'));

		Button(node, {
			variant: 'ghost',
			size: 'icon',
			get href() {
				return $.get($0);
			},
			class: 'nodefault shrink-0',
			children: ($$anchor, $$slotProps) => {
				ArrowLeft($$anchor, { class: 'size-4' });
			},
			$$slots: { default: true }
		});
	}

	var div_2 = $.sibling(node, 2);
	var span_1 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(span_1);

	Radio(node_1, { class: 'size-3 shrink-0 opacity-70' });

	var span_2 = $.sibling(node_1, 2);

	span_2.textContent = 'edra:demoroom';
	$.reset(span_1);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_2 = $.child(div_3);

	$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_13();
				var node_3 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none', $.get(status) === 'connected'
						? 'border-border bg-card'
						: $.get(status) === 'connecting'
							? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
							: 'border-destructive/30 bg-destructive/10 text-destructive'));

					$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							'aria-label': 'Collaborators',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_7();
								var span_3 = $.first_child(fragment_2);
								var node_4 = $.child(span_3);

								{
									var consequent = ($$anchor) => {
										var fragment_3 = root_1();

										$.next(2);
										$.append($$anchor, fragment_3);
									};

									var consequent_1 = ($$anchor) => {
										var fragment_4 = root_2();

										$.next(2);
										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var span_4 = root_3();

										$.append($$anchor, span_4);
									};

									$.if(node_4, ($$render) => {
										if ($.get(status) === 'connected') $$render(consequent); else if ($.get(status) === 'connecting') $$render(consequent_1, 1); else $$render(alternate, -1);
									});
								}

								$.reset(span_3);

								var node_5 = $.sibling(span_3, 2);

								{
									var consequent_3 = ($$anchor) => {
										var fragment_5 = root_5();
										var span_5 = $.first_child(fragment_5);
										var node_6 = $.child(span_5);

										$.each(node_6, 17, () => $.get(visibleUsers), (u) => u.clientId ?? u.name, ($$anchor, u) => {
											avatar($$anchor, () => $.get(u).name, () => $.get(u).color, () => 'trigger');
										});

										var node_7 = $.sibling(node_6, 2);

										{
											var consequent_2 = ($$anchor) => {
												var span_6 = root_4();
												var text_1 = $.only_child(span_6);

												$.template_effect(() => $.set_text(text_1, `+${$.get(overflowCount) ?? ''}`));
												$.append($$anchor, span_6);
											};

											$.if(node_7, ($$render) => {
												if ($.get(overflowCount) > 0) $$render(consequent_2);
											});
										}

										$.reset(span_5);

										var span_7 = $.sibling(span_5, 2);
										var node_8 = $.child(span_7);

										Users(node_8, { class: 'size-3 opacity-70 sm:hidden' });

										var span_8 = $.sibling(node_8, 2);
										var text_2 = $.only_child(span_8, true);

										$.reset(span_7);
										$.template_effect(() => $.set_text(text_2, $.get(userCount)));
										$.append($$anchor, fragment_5);
									};

									var alternate_1 = ($$anchor) => {
										var span_9 = root_6();
										var text_3 = $.only_child(span_9, true);

										$.template_effect(() => $.set_text(text_3, $.get(statusLabel)));
										$.append($$anchor, span_9);
									};

									$.if(node_5, ($$render) => {
										if ($.get(status) === 'connected' && $.get(activeUsers).length) $$render(consequent_3); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_9 = $.sibling(node_3, 2);

				$.component(node_9, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-80 p-0',
						align: 'end',
						sideOffset: 8,
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_12();
							var div_4 = $.first_child(fragment_7);
							var div_5 = $.child(div_4);
							var span_10 = $.child(div_5);
							var span_11 = $.sibling(span_10, 2);
							var text_4 = $.only_child(span_11, true);
							var span_12 = $.sibling(span_11, 4);
							var text_5 = $.only_child(span_12);

							$.reset(div_5);

							var span_13 = $.sibling(div_5, 2);

							span_13.textContent = 'edra:demoroom';
							$.reset(div_4);

							var div_6 = $.sibling(div_4, 2);
							var node_10 = $.child(div_6);

							{
								var consequent_5 = ($$anchor) => {
									var ul = root_10();

									$.each(ul, 21, () => $.get(activeUsers), (u) => u.clientId ?? u.name, ($$anchor, u) => {
										var li = root_9();
										var node_11 = $.child(li);

										avatar(node_11, () => $.get(u).name, () => $.get(u).color, () => 'list');

										var div_7 = $.sibling(node_11, 2);
										var div_8 = $.child(div_7);
										var span_14 = $.child(div_8);
										var text_6 = $.only_child(span_14, true);
										var node_12 = $.sibling(span_14, 2);

										{
											var consequent_4 = ($$anchor) => {
												var span_15 = root_8();

												$.append($$anchor, span_15);
											};

											$.if(node_12, ($$render) => {
												if ($.get(u).clientId === provider?.awareness?.clientID) $$render(consequent_4);
											});
										}

										$.reset(div_8);
										$.next(2);
										$.reset(div_7);
										$.reset(li);
										$.template_effect(() => $.set_text(text_6, $.get(u).name));
										$.append($$anchor, li);
									});

									$.reset(ul);
									$.append($$anchor, ul);
								};

								var alternate_2 = ($$anchor) => {
									var p = root_11();

									$.append($$anchor, p);
								};

								$.if(node_10, ($$render) => {
									if ($.get(activeUsers).length) $$render(consequent_5); else $$render(alternate_2, -1);
								});
							}

							$.reset(div_6);
							$.next(2);

							$.template_effect(
								($0) => {
									$.set_class(span_10, 1, $0);
									$.set_text(text_4, $.get(statusLabel));
									$.set_text(text_5, `${$.get(userCount) ?? ''} ${$.get(userCount) === 1 ? 'person' : 'people'}`);
								},
								[
									() => $.clsx(cn('size-2 rounded-full', $.get(status) === 'connected'
										? 'bg-emerald-500'
										: $.get(status) === 'connecting' ? 'bg-amber-500' : 'bg-destructive'))
								]
							);

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => resolve('/docs/collaboration'));

		Button(node_13, {
			variant: 'ghost',
			size: 'sm',
			get href() {
				return $.get($0);
			},
			class: 'nodefault hidden gap-1.5 md:inline-flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_14();
				var node_14 = $.first_child(fragment_8);

				BookOpen(node_14, { class: 'size-4' });
				$.next();
				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	}

	var node_15 = $.sibling(node_13, 2);

	{
		let $0 = $.derived(() => resolve('/docs/collaboration'));

		Button(node_15, {
			variant: 'ghost',
			size: 'icon',
			get href() {
				return $.get($0);
			},
			class: 'nodefault md:hidden',
			'aria-label': 'Collaboration docs',
			children: ($$anchor, $$slotProps) => {
				BookOpen($$anchor, { class: 'size-4' });
			},
			$$slots: { default: true }
		});
	}

	var node_16 = $.sibling(node_15, 2);

	Button(node_16, {
		variant: 'outline',
		class: 'h-8 gap-1.5 px-2 sm:px-2.5',
		onclick: openUserDialog,
		'aria-label': 'Edit display name',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_15();
			var node_17 = $.first_child(fragment_10);

			avatar(node_17, () => $.get(currentUser).name, () => $.get(currentUser).color, () => 'button');

			var span_16 = $.sibling(node_17, 2);
			var text_7 = $.only_child(span_16, true);
			var node_18 = $.sibling(span_16, 2);

			Pencil(node_18, { class: 'hidden size-3 opacity-60 sm:inline' });
			$.template_effect(() => $.set_text(text_7, $.get(currentUser).name));
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_16, 2);

	ToggleMode(node_19, {});
	$.reset(div_3);
	$.reset(header);

	var node_20 = $.sibling(header, 2);

	$.component(node_20, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(userDialogOpen);
			},

			set open($$value) {
				$.set(userDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_11 = $.comment();
				var node_21 = $.first_child(fragment_11);

				$.component(node_21, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_16();
							var node_22 = $.first_child(fragment_12);

							$.component(node_22, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root_13();
										var node_23 = $.first_child(fragment_13);

										$.component(node_23, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Edit display name');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('This name and color are shown to collaborators in the realtime session.');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							var div_9 = $.sibling(node_22, 2);
							var div_10 = $.child(div_9);
							var node_25 = $.child(div_10);

							{
								let $0 = $.derived(() => $.get(pendingName).trim() || $.get(currentUser).name);

								avatar(node_25, () => $.get($0), () => $.get(pendingColor), () => 'dialog');
							}

							var div_11 = $.sibling(node_25, 2);
							var span_17 = $.child(div_11);
							var text_10 = $.only_child(span_17, true);

							$.next(2);
							$.reset(div_11);

							var node_26 = $.sibling(div_11, 2);

							Button(node_26, {
								variant: 'ghost',
								size: 'icon',
								class: 'ml-auto shrink-0',
								onclick: shufflePendingColor,
								'aria-label': 'Shuffle color',
								children: ($$anchor, $$slotProps) => {
									Shuffle($$anchor, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$.reset(div_10);

							var div_12 = $.sibling(div_10, 2);
							var node_27 = $.sibling($.child(div_12), 2);

							Input(node_27, {
								id: 'collab-name',
								placeholder: 'e.g. Jane Doe',
								maxlength: 32,
								autocomplete: 'name',
								onkeydown: (e) => {
									if (e.key === 'Enter') saveUser();
								},

								get value() {
									return $.get(pendingName);
								},

								set value($$value) {
									$.set(pendingName, $$value, true);
								}
							});

							var p_1 = $.sibling(node_27, 2);
							var text_11 = $.only_child(p_1);

							$.reset(div_12);
							$.reset(div_9);

							var node_28 = $.sibling(div_9, 2);

							$.component(node_28, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = root_13();
										var node_29 = $.first_child(fragment_15);

										Button(node_29, {
											variant: 'outline',
											onclick: () => $.set(userDialogOpen, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Cancel');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});

										var node_30 = $.sibling(node_29, 2);

										{
											let $0 = $.derived(() => !$.get(pendingName).trim());

											Button(node_30, {
												onclick: saveUser,
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Save');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(
								($0, $1) => {
									$.set_text(text_10, $0);
									$.set_text(text_11, `${$1 ?? ''}/32`);
								},
								[
									() => $.get(pendingName).trim() || 'Your name',
									() => $.get(pendingName).trim().length
								]
							);

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	});

	var node_31 = $.sibling(node_20, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_13 = root_17();
			var span_18 = $.child(div_13);
			var span_19 = $.sibling(span_18, 2);
			var text_14 = $.only_child(span_19, true);

			$.next(4);
			$.reset(div_13);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_13, 1, $0);
					$.set_class(span_18, 1, $1);

					$.set_text(text_14, $.get(status) === 'connecting'
						? 'Connecting to realtime server…'
						: 'Offline — reconnecting…');
				},
				[
					() => $.clsx(cn('mx-auto flex w-full max-w-3xl items-center gap-2 rounded-lg border px-3 py-2 text-xs shadow-sm sm:mt-3', $.get(status) === 'connecting'
						? 'border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200'
						: 'border-destructive/20 bg-destructive/10 text-destructive')),
					() => $.clsx(cn('size-2 shrink-0 rounded-full', $.get(status) === 'connecting' ? 'animate-pulse bg-amber-500' : 'bg-destructive'))
				]
			);

			$.append($$anchor, div_13);
		};

		$.if(node_31, ($$render) => {
			if ($.get(status) !== 'connected') $$render(consequent_6);
		});
	}

	var main = $.sibling(node_31, 4);
	var node_32 = $.child(main);

	{
		var consequent_7 = ($$anchor) => {
			Edra($$anchor, {
				get editor() {
					return $.get(editor);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root_18();
					var node_33 = $.first_child(fragment_17);

					$.component(node_33, () => Edra.UseAI, ($$anchor, Edra_UseAI) => {
						Edra_UseAI($$anchor, {});
					});

					var node_34 = $.sibling(node_33, 2);

					$.component(node_34, () => Edra.ToC, ($$anchor, Edra_ToC) => {
						Edra_ToC($$anchor, {});
					});

					var node_35 = $.sibling(node_34, 2);

					$.component(node_35, () => Edra.BubbleMenu, ($$anchor, Edra_BubbleMenu) => {
						Edra_BubbleMenu($$anchor, {});
					});

					var node_36 = $.sibling(node_35, 2);

					{
						let $0 = $.derived(() => cn('mx-auto w-full max-w-3xl cursor-auto px-4 py-4 text-base transition-all duration-300 *:outline-none sm:px-8'));

						$.component(node_36, () => Edra.Content, ($$anchor, Edra_Content) => {
							Edra_Content($$anchor, {
								get class() {
									return $.get($0);
								}
							});
						});
					}

					var node_37 = $.sibling(node_36, 2);

					$.component(node_37, () => Edra.DragHandle, ($$anchor, Edra_DragHandle) => {
						Edra_DragHandle($$anchor, { type: 'extended', class: 'transition-all! duration-300!' });
					});

					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});
		};

		var alternate_3 = ($$anchor) => {
			var div_14 = root_19();
			var node_38 = $.child(div_14);

			Skeleton(node_38, { class: 'h-6 w-3/4' });

			var node_39 = $.sibling(node_38, 2);

			Skeleton(node_39, { class: 'h-4 w-full' });

			var node_40 = $.sibling(node_39, 2);

			Skeleton(node_40, { class: 'h-4 w-5/6' });

			var node_41 = $.sibling(node_40, 2);

			Skeleton(node_41, { class: 'mt-2 h-4 w-full' });

			var node_42 = $.sibling(node_41, 2);

			Skeleton(node_42, { class: 'h-4 w-4/5' });

			var node_43 = $.sibling(node_42, 2);

			Skeleton(node_43, { class: 'h-4 w-3/5' });
			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_32, ($$render) => {
			if ($.get(editor)) $$render(consequent_7); else $$render(alternate_3, -1);
		});
	}

	$.reset(main);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}