import * as $ from 'svelte/internal/server';
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

function avatar($$renderer, name, color, variant) {
	const classes = variant === 'button'
		? 'size-5 text-[11px] leading-none'
		: variant === 'trigger'
			? 'size-6 text-[10px] leading-none border-2 border-background shadow-sm'
			: variant === 'list'
				? 'size-8 shrink-0 text-xs shadow-sm'
				: 'size-10 shrink-0 text-sm shadow-sm';

	$$renderer.push(`<span${$.attr_class($.clsx(cn('grid place-items-center rounded-md font-bold text-white', classes)))}${$.attr('title', name)} aria-hidden="true"${$.attr_style('', { 'background-color': color })}>${$.escape((name || '?').charAt(0).toUpperCase())}</span>`);
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let editor = void 0;
		let provider;
		let ydoc;
		let userDialogOpen = false;
		let pendingName = '';
		let pendingColor = '';
		const initialUser = getInitialUser();
		let currentUser = initialUser;
		let status = 'connecting';
		let activeUsers = [];

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
				const fallback = status === 'connected' ? [{ ...currentUser, clientId: 0 }] : [];

				if (fallback.length !== activeUsers.length) activeUsers = fallback;

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

			if (status === 'connected' && !list.some((u) => u.clientId === selfId)) {
				list.push({ ...currentUser, clientId: selfId });
			}

			list.sort((a, b) => {
				if (a.clientId === selfId) return -1;
				if (b.clientId === selfId) return 1;

				return a.name.localeCompare(b.name);
			});

			if (list.length === activeUsers.length && list.every((u, i) => u.clientId === activeUsers[i]?.clientId && u.name === activeUsers[i]?.name && u.color === activeUsers[i]?.color)) {
				return;
			}

			activeUsers = list;
		}

		const userCount = $.derived(() => activeUsers.length || (status === 'connected' ? 1 : 0));
		const visibleUsers = $.derived(() => activeUsers.slice(0, 4));
		const overflowCount = $.derived(() => Math.max(0, activeUsers.length - 4));

		const statusLabel = $.derived(() => status === 'connected'
			? 'Live'
			: status === 'connecting' ? 'Connecting' : 'Offline');

		function openUserDialog() {
			pendingName = currentUser.name;
			pendingColor = currentUser.color;
			userDialogOpen = true;
		}

		function shufflePendingColor() {
			pendingColor = getRandomColor();
		}

		function saveUser() {
			const name = pendingName.trim().slice(0, 32);

			if (!name) return;

			const next = { name, color: pendingColor };

			currentUser = next;
			persistUser(next);

			if (editor) {
				editor.commands.updateUser(next);
			}

			scheduleUpdate();
			userDialogOpen = false;
		}

		if (browser) {
			ydoc = new Doc();
			provider = new HocuspocusProvider({ url: PUBLIC_REALTIME_URL, name: ROOM_NAME, document: ydoc });

			onStatusHandler = (e) => {
				status = e.status;
				scheduleUpdate();
			};

			onSyncHandler = () => scheduleUpdate();
			onAwarenessHandler = () => scheduleUpdate();
			provider.on('status', onStatusHandler);
			provider.on('synced', onSyncHandler);
			provider.on('connect', onSyncHandler);

			provider.on('disconnect', () => {
				status = 'disconnected';
				scheduleUpdate();
			});

			provider.awareness?.on('update', onAwarenessHandler);

			editor = createEditor({
				collaborative: true,
				callAI: sampleCallAI,
				extensions: [
					Collaboration.configure({ document: ydoc }),
					CollaborationCaret.configure({ provider, user: initialUser })
				]
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('16wt24y', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Realtime Workspace | Edra</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen flex-col bg-background text-foreground"><header class="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-4 md:px-6"><div class="flex min-w-0 items-center gap-2 sm:gap-3">`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				href: resolve('/'),
				class: 'nodefault shrink-0',
				children: ($$renderer) => {
					ArrowLeft($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex min-w-0 items-center gap-2"><span class="truncate text-sm font-semibold tracking-tight">Realtime</span> <span class="hidden items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-flex">`);
			Radio($$renderer, { class: 'size-3 shrink-0 opacity-70' });
			$$renderer.push(`<!----> <span class="truncate">edra:demoroom</span></span></div></div> <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">`);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: cn('inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none', status === 'connected'
									? 'border-border bg-card'
									: status === 'connecting'
										? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
										: 'border-destructive/30 bg-destructive/10 text-destructive'),
								'aria-label': 'Collaborators',
								children: ($$renderer) => {
									$$renderer.push(`<span class="relative flex size-2 shrink-0">`);

									if (status === 'connected') {
										$$renderer.push(`<!--[0--><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span> <span class="relative inline-flex size-2 rounded-full bg-emerald-500"></span>`);
									} else if (status === 'connecting') {
										$$renderer.push(`<!--[1--><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span> <span class="relative inline-flex size-2 rounded-full bg-amber-500"></span>`);
									} else {
										$$renderer.push(`<!--[-1--><span class="relative inline-flex size-2 rounded-full bg-destructive"></span>`);
									}

									$$renderer.push(`<!--]--></span> `);

									if (status === 'connected' && activeUsers.length) {
										$$renderer.push(`<!--[0--><span class="hidden items-center -space-x-1.5 sm:flex"><!--[-->`);

										const each_array = $.ensure_array_like(visibleUsers());

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let u = each_array[$$index];

											avatar($$renderer, u.name, u.color, 'trigger');
										}

										$$renderer.push(`<!--]--> `);

										if (overflowCount() > 0) {
											$$renderer.push(`<!--[0--><span class="grid size-6 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground">+${$.escape(overflowCount())}</span>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></span> <span class="inline-flex items-center gap-1">`);
										Users($$renderer, { class: 'size-3 opacity-70 sm:hidden' });
										$$renderer.push(`<!----> <span class="tabular-nums">${$.escape(userCount())}</span></span>`);
									} else {
										$$renderer.push(`<!--[-1--><span class="capitalize">${$.escape(statusLabel())}</span>`);
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

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-80 p-0',
								align: 'end',
								sideOffset: 8,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center justify-between border-b px-3 py-2.5"><div class="flex items-center gap-2"><span${$.attr_class($.clsx(cn('size-2 rounded-full', status === 'connected'
										? 'bg-emerald-500'
										: status === 'connecting' ? 'bg-amber-500' : 'bg-destructive')))}></span> <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">${$.escape(statusLabel())}</span> <span class="text-xs text-muted-foreground">·</span> <span class="text-xs font-medium tabular-nums">${$.escape(userCount())} ${$.escape(userCount() === 1 ? 'person' : 'people')}</span></div> <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">edra:demoroom</span></div> <div class="max-h-72 overflow-y-auto p-2">`);

									if (activeUsers.length) {
										$$renderer.push(`<!--[0--><ul class="space-y-0.5"><!--[-->`);

										const each_array_1 = $.ensure_array_like(activeUsers);

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let u = each_array_1[$$index_1];

											$$renderer.push(`<li class="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60">`);
											avatar($$renderer, u.name, u.color, 'list');
											$$renderer.push(`<!----> <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="truncate text-sm leading-none font-medium">${$.escape(u.name)}</span> `);

											if (u.clientId === provider?.awareness?.clientID) {
												$$renderer.push(`<!--[0--><span class="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary">You</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div> <span class="flex items-center gap-1 text-[11px] text-muted-foreground"><span class="size-1 rounded-full bg-emerald-500"></span> Active now</span></div></li>`);
										}

										$$renderer.push(`<!--]--></ul>`);
									} else {
										$$renderer.push(`<!--[-1--><p class="px-2 py-6 text-center text-xs text-muted-foreground">No collaborators yet.<br/>Share this page to invite others.</p>`);
									}

									$$renderer.push(`<!--]--></div> <div class="border-t bg-muted/30 px-3 py-2"><p class="text-[11px] leading-snug text-muted-foreground">Cursors and selections are shown in real time. Changes sync automatically.</p></div>`);
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

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				href: resolve('/docs/collaboration'),
				class: 'nodefault hidden gap-1.5 md:inline-flex',
				children: ($$renderer) => {
					BookOpen($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----> Docs`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				href: resolve('/docs/collaboration'),
				class: 'nodefault md:hidden',
				'aria-label': 'Collaboration docs',
				children: ($$renderer) => {
					BookOpen($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				class: 'h-8 gap-1.5 px-2 sm:px-2.5',
				onclick: openUserDialog,
				'aria-label': 'Edit display name',
				children: ($$renderer) => {
					avatar($$renderer, currentUser.name, currentUser.color, 'button');
					$$renderer.push(`<!----> <span class="hidden max-w-24 truncate text-xs font-medium sm:inline">${$.escape(currentUser.name)}</span> `);
					Pencil($$renderer, { class: 'hidden size-3 opacity-60 sm:inline' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			ToggleMode($$renderer, {});
			$$renderer.push(`<!----></div></header> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return userDialogOpen;
					},

					set open($$value) {
						userDialogOpen = $$value;
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
															$$renderer.push(`<!---->Edit display name`);
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
															$$renderer.push(`<!---->This name and color are shown to collaborators in the realtime session.`);
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

									$$renderer.push(` <div class="grid gap-4 py-2"><div class="flex items-center gap-3">`);
									avatar($$renderer, pendingName.trim() || currentUser.name, pendingColor, 'dialog');
									$$renderer.push(`<!----> <div class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">${$.escape(pendingName.trim() || 'Your name')}</span> <span class="text-xs text-muted-foreground">Visible to everyone in this room</span></div> `);

									Button($$renderer, {
										variant: 'ghost',
										size: 'icon',
										class: 'ml-auto shrink-0',
										onclick: shufflePendingColor,
										'aria-label': 'Shuffle color',
										children: ($$renderer) => {
											Shuffle($$renderer, { class: 'size-4' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> <div class="grid gap-2"><label for="collab-name" class="text-sm font-medium">Display name</label> `);

									Input($$renderer, {
										id: 'collab-name',
										placeholder: 'e.g. Jane Doe',
										maxlength: 32,
										autocomplete: 'name',
										onkeydown: (e) => {
											if (e.key === 'Enter') saveUser();
										},

										get value() {
											return pendingName;
										},

										set value($$value) {
											pendingName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-xs text-muted-foreground tabular-nums">${$.escape(pendingName.trim().length)}/32</p></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => userDialogOpen = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													onclick: saveUser,
													disabled: !pendingName.trim(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Save`);
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

			$$renderer.push(` `);

			if (status !== 'connected') {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn('mx-auto flex w-full max-w-3xl items-center gap-2 rounded-lg border px-3 py-2 text-xs shadow-sm sm:mt-3', status === 'connecting'
					? 'border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200'
					: 'border-destructive/20 bg-destructive/10 text-destructive')))}><span${$.attr_class($.clsx(cn('size-2 shrink-0 rounded-full', status === 'connecting' ? 'animate-pulse bg-amber-500' : 'bg-destructive')))}></span> <span class="font-medium">${$.escape(status === 'connecting'
					? 'Connecting to realtime server…'
					: 'Offline — reconnecting…')}</span> <span class="hidden text-muted-foreground sm:inline">·</span> <span class="hidden text-muted-foreground sm:inline">Edits will sync when back online.</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <h3 class="animate-pulse py-4 text-center">Changes are streamed in real time.</h3> <main class="flex-1 overflow-y-auto pb-24 sm:pb-32">`);

			if (editor) {
				$$renderer.push('<!--[0-->');

				Edra($$renderer, {
					editor,
					children: ($$renderer) => {
						if (Edra.UseAI) {
							$$renderer.push('<!--[-->');
							Edra.UseAI($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Edra.ToC) {
							$$renderer.push('<!--[-->');
							Edra.ToC($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Edra.BubbleMenu) {
							$$renderer.push('<!--[-->');
							Edra.BubbleMenu($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Edra.Content) {
							$$renderer.push('<!--[-->');

							Edra.Content($$renderer, {
								class: cn('mx-auto w-full max-w-3xl cursor-auto px-4 py-4 text-base transition-all duration-300 *:outline-none sm:px-8')
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Edra.DragHandle) {
							$$renderer.push('<!--[-->');
							Edra.DragHandle($$renderer, { type: 'extended', class: 'transition-all! duration-300!' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-8">`);
				Skeleton($$renderer, { class: 'h-6 w-3/4' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-full' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-5/6' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'mt-2 h-4 w-full' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-4/5' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-3/5' });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></main></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}