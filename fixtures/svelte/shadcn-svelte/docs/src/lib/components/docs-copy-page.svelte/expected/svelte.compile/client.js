import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import CheckIcon from "@tabler/icons-svelte/icons/check";
import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

const Trigger = ($$anchor, $$arg0) => {
	let props = () => ($$arg0?.()).props;

	{
		let $0 = $.derived(() => cn("peer -ms-0.5 size-8 shadow-none md:size-7 md:text-[0.8rem]", props().class));

		Button($$anchor, $.spread_props(props, {
			variant: 'secondary',
			size: 'sm',
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				ChevronDownIcon($$anchor, { class: 'rotate-180 sm:rotate-0' });
			},
			$$slots: { default: true }
		}));
	}
};

var root = $.from_html(`<a><svg stroke-linejoin="round" viewBox="0 0 22 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 2.25H2.5C1.80964 2.25 1.25 2.80964 1.25 3.5V12.5C1.25 13.1904 1.80964 13.75 2.5 13.75H19.5C20.1904 13.75 20.75 13.1904 20.75 12.5V3.5C20.75 2.80964 20.1904 2.25 19.5 2.25ZM2.5 1C1.11929 1 0 2.11929 0 3.5V12.5C0 13.8807 1.11929 15 2.5 15H19.5C20.8807 15 22 13.8807 22 12.5V3.5C22 2.11929 20.8807 1 19.5 1H2.5ZM3 4.5H4H4.25H4.6899L4.98715 4.82428L7 7.02011L9.01285 4.82428L9.3101 4.5H9.75H10H11V5.5V11.5H9V7.79807L7.73715 9.17572L7 9.97989L6.26285 9.17572L5 7.79807V11.5H3V5.5V4.5ZM15 8V4.5H17V8H19.5L17 10.5L16 11.5L15 10.5L12.5 8H15Z" fill="currentColor"></path></svg> View as Markdown</a>`);
var root_1 = $.from_html(`<a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 147 70" fill="currentColor"><path d="M56 50.203V14h14v46.156C70 65.593 65.593 70 60.156 70c-2.596 0-5.158-1-7-2.843L0 14h19.797L56 50.203ZM147 56h-14V23.953L100.953 56H133v14H96.687C85.814 70 77 61.186 77 50.312V14h14v32.156L123.156 14H91V0h36.312C138.186 0 147 8.814 147 19.688V56Z" fill="currentColor"></path></svg> Open in v0</a>`);
var root_2 = $.from_html(`<a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" fill="currentColor"></path></svg> Open in ChatGPT</a>`);
var root_3 = $.from_html(`<a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4.714 15.956 4.718-2.648.079-.23-.08-.128h-.23l-.79-.048-2.695-.073-2.337-.097-2.265-.122-.57-.121-.535-.704.055-.353.48-.321.685.06 1.518.104 2.277.157 1.651.098 2.447.255h.389l.054-.158-.133-.097-.103-.098-2.356-1.596-2.55-1.688-1.336-.972-.722-.491L2 6.223l-.158-1.008.655-.722.88.06.225.061.893.686 1.906 1.476 2.49 1.833.364.304.146-.104.018-.072-.164-.274-1.354-2.446-1.445-2.49-.644-1.032-.17-.619a2.972 2.972 0 0 1-.103-.729L6.287.133 6.7 0l.995.134.42.364.619 1.415L9.735 4.14l1.555 3.03.455.898.243.832.09.255h.159V9.01l.127-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.286 1.851-.558 2.903-.365 1.942h.213l.243-.242.983-1.306 1.652-2.064.728-.82.85-.904.547-.431h1.032l.759 1.129-.34 1.166-1.063 1.347-.88 1.142-1.263 1.7-.79 1.36.074.11.188-.02 2.853-.606 1.542-.28 1.84-.315.832.388.09.395-.327.807-1.967.486-2.307.462-3.436.813-.043.03.049.061 1.548.146.662.036h1.62l3.018.225.79.522.473.638-.08.485-1.213.62-1.64-.389-3.825-.91-1.31-.329h-.183v.11l1.093 1.068 2.003 1.81 2.508 2.33.127.578-.321.455-.34-.049-2.204-1.657-.85-.747-1.925-1.62h-.127v.17l.443.649 2.343 3.521.122 1.08-.17.353-.607.213-.668-.122-1.372-1.924-1.415-2.168-1.141-1.943-.14.08-.674 7.254-.316.37-.728.28-.607-.461-.322-.747.322-1.476.388-1.924.316-1.53.285-1.9.17-.632-.012-.042-.14.018-1.432 1.967-2.18 2.945-1.724 1.845-.413.164-.716-.37.066-.662.401-.589 2.386-3.036 1.439-1.882.929-1.086-.006-.158h-.055L4.138 18.56l-1.13.146-.485-.456.06-.746.231-.243 1.907-1.312Z" fill="currentColor"></path></svg> Open in Claude</a>`);
var root_4 = $.from_html(`<!> Copy Page`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="group/buttons relative flex rounded-lg bg-secondary *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10" data-llm-ignore=""><div></div> <!> <!> <!> <!> <!></div>`);

export default function Docs_copy_page($$anchor, $$props) {
	$.push($$props, true);

	const Markdown = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		var a = root();

		$.attribute_effect(a, () => ({
			...props(),
			href: `${$.get(pageUrl)}.md`,
			target: '_blank',
			rel: 'noopener noreferrer'
		}));

		$.append($$anchor, a);
	};

	const v0 = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		var a_1 = root_1();

		$.attribute_effect(
			a_1,
			($0) => ({
				...props(),
				href: $0,
				target: '_blank',
				rel: 'noopener noreferrer'
			}),
			[() => getPromptUrl("https://v0.dev")]
		);

		$.append($$anchor, a_1);
	};

	const ChatGPT = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		var a_2 = root_2();

		$.attribute_effect(
			a_2,
			($0) => ({
				...props(),
				href: $0,
				target: '_blank',
				rel: 'noopener noreferrer'
			}),
			[() => getPromptUrl("https://chatgpt.com")]
		);

		$.append($$anchor, a_2);
	};

	const Claude = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		var a_3 = root_3();

		$.attribute_effect(
			a_3,
			($0) => ({
				...props(),
				href: $0,
				target: '_blank',
				rel: 'noopener noreferrer'
			}),
			[() => getPromptUrl("https://claude.ai/new")]
		);

		$.append($$anchor, a_3);
	};

	const pageUrl = $.derived(() => page.url.origin + page.url.pathname);

	function getPromptUrl(baseURL) {
		return `${baseURL}?q=${encodeURIComponent(`I’m looking at this shadcn-svelte documentation: ${$.get(pageUrl)}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
  `)}`;
	}

	const menuItems = { markdown: Markdown, v0, chatgpt: ChatGPT, claude: Claude };
	const clipboard = new UseClipboard();
	let customAnchor = $.state(null);

	async function copyPage() {
		const res = await fetch(`${$.get(pageUrl)}.md`);
		const text = await res.text();

		await clipboard.copy(text);
	}

	var fragment_2 = $.comment();
	var node = $.first_child(fragment_2);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var div = root_6();
				var div_1 = $.child(div);

				$.bind_this(div_1, ($$value) => $.set(customAnchor, $$value), () => $.get(customAnchor));

				var node_1 = $.sibling(div_1, 2);

				Button(node_1, {
					variant: 'secondary',
					size: 'sm',
					class: 'h-8 shadow-none select-none md:h-7 md:text-[0.8rem]',
					onclick: copyPage,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_4();
						var node_2 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								CheckIcon($$anchor, {});
							};

							var alternate = ($$anchor) => {
								CopyIcon($$anchor, {});
							};

							$.if(node_2, ($$render) => {
								if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.next();
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_5();
							var node_4 = $.first_child(fragment_6);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Trigger($$anchor, () => ({ props: props() }));
								};

								$.component(node_4, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, { class: 'hidden sm:flex', child, $$slots: { child: true } });
								});
							}

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'end',
									class: 'w-max shadow-none',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_6 = $.first_child(fragment_8);

										$.each(node_6, 17, () => Object.entries(menuItems), ([key, value]) => key, ($$anchor, $$item) => {
											var $$array = $.derived(() => $.to_array($.get($$item), 2));
											let key = () => $.get($$array)[0];
											let value = () => $.get($$array)[1];
											var fragment_9 = $.comment();
											var node_7 = $.first_child(fragment_9);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var fragment_10 = $.comment();
													var node_8 = $.first_child(fragment_10);

													{
														let $0 = $.derived(() => ({
															props: { ...props(), class: cn(props().class, "whitespace-nowrap") }
														}));

														$.snippet(node_8, value, () => $.get($0));
													}

													$.append($$anchor, fragment_10);
												};

												$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, { child, $$slots: { child: true } });
												});
											}

											$.append($$anchor, fragment_9);
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_3, 2);

				Separator(node_9, {
					orientation: 'vertical',
					class: 'absolute end-8 top-0 z-0 h-8! bg-foreground/10! peer-focus-visible:opacity-0 sm:end-7 sm:h-7!'
				});

				var node_10 = $.sibling(node_9, 2);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Trigger($$anchor, () => ({ props: props() }));
					};

					$.component(node_10, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { class: 'flex sm:hidden', child, $$slots: { child: true } });
					});
				}

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-52 origin-center! rounded-lg bg-background/70 p-1 shadow-sm backdrop-blur-sm dark:bg-background/60',
						align: 'start',
						get customAnchor() {
							return $.get(customAnchor);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_12 = $.comment();
							var node_12 = $.first_child(fragment_12);

							$.each(node_12, 17, () => Object.entries(menuItems), ([key, value]) => key, ($$anchor, $$item) => {
								var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array_1)[0];
								let value = () => $.get($$array_1)[1];
								var fragment_13 = $.comment();
								var node_13 = $.first_child(fragment_13);

								{
									let $0 = $.derived(() => ({
										props: {
											class: cn(buttonVariants({ variant: "ghost", size: "lg" }), "*:[svg]:text-muted-foreground w-full justify-start whitespace-nowrap text-base font-normal")
										}
									}));

									$.snippet(node_13, value, () => $.get($0));
								}

								$.append($$anchor, fragment_13);
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_2);
	$.pop();
}