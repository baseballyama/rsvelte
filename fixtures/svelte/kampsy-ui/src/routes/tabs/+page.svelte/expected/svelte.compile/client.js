import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Tabs } from "$lib/index.js";

import {
	tabsDefault,
	tabsDisabled,
	tabsDisabledSpecific,
	tabsSecondary,
	tabsWithIcons
} from "../../docs/data/tabs.js";

import { LogoBitbucketColor, LogoGithub, LogoGitlab } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const tabs = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "table", href: "/table" },
				next: { title: "text", href: "/text" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">tabs</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display tab content.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultTabs = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_2();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/tabs#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						Tabs($$anchor, {
							tabs: [
								{ title: "Apple", value: "apple" },
								{ title: "Orange", value: "orange" },
								{ title: "Mango", value: "mango" }
							],

							get selected() {
								return $.get(selected);
							},

							set selected($$value) {
								$.set(selected, $$value, true);
							}
						});
					};

					var node_3 = $.child(div_4);

					demoAndCode(node_3, () => demo, () => tabsDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const disabled = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();
				var node_4 = $.first_child(fragment_6);

				LinkH2(node_4, {
					href: '/tabs#disabled',
					'aria-label': 'disabled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('disabled');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_4, 2);

				{
					const demo = ($$anchor) => {
						Tabs($$anchor, {
							disabled: true,
							tabs: [
								{ title: "Apple", value: "apple" },
								{ title: "Orange", value: "orange" },
								{ title: "Mango", value: "mango" }
							],

							get selected() {
								return $.get(tabDisabled);
							},

							set selected($$value) {
								$.set(tabDisabled, $$value, true);
							}
						});
					};

					var node_5 = $.child(div_5);

					demoAndCode(node_5, () => demo, () => tabsDisabled);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	};

	const disableSpecific = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_2();
				var node_6 = $.first_child(fragment_9);

				LinkH2(node_6, {
					href: '/tabs#disable-specific-tabs',
					'aria-label': 'disable specific tabs',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('disable specific tabs');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var div_6 = $.sibling(node_6, 2);

				{
					const demo = ($$anchor) => {
						Tabs($$anchor, {
							tabs: [
								{ title: "Apple", value: "apple" },
								{ title: "Orange", value: "orange" },
								{
									title: "Mango",
									value: "mango",
									disabled: true,
									tooltip: "Mangos are not allowed"
								}
							],

							get selected() {
								return $.get(tabDisabledSpecific);
							},

							set selected($$value) {
								$.set(tabDisabledSpecific, $$value, true);
							}
						});
					};

					var node_7 = $.child(div_6);

					demoAndCode(node_7, () => demo, () => tabsDisabledSpecific);
					$.reset(div_6);
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	};

	const withIcons = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_12 = root_2();
				var node_8 = $.first_child(fragment_12);

				LinkH2(node_8, {
					href: '/tabs#with-icons',
					'aria-label': 'with-icons',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('with icons');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var div_7 = $.sibling(node_8, 2);

				{
					const demo = ($$anchor) => {
						{
							let $0 = $.derived(() => [
								{ title: "Github", value: "github", icon: LogoGithub },
								{ title: "Gitlab", value: "gitlab", icon: LogoGitlab },
								{
									title: "Bitbucket",
									value: "bitbucket",
									icon: LogoBitbucketColor
								}
							]);

							Tabs($$anchor, {
								get tabs() {
									return $.get($0);
								},

								get selected() {
									return $.get(tabWithIcons);
								},

								set selected($$value) {
									$.set(tabWithIcons, $$value, true);
								}
							});
						}
					};

					var node_9 = $.child(div_7);

					demoAndCode(node_9, () => demo, () => tabsWithIcons);
					$.reset(div_7);
				}

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	};

	const secondary = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_15 = root_2();
				var node_10 = $.first_child(fragment_15);

				LinkH2(node_10, {
					href: '/tabs#secondary',
					'aria-label': 'secondary',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('secondary');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var div_8 = $.sibling(node_10, 2);

				{
					const demo = ($$anchor) => {
						Tabs($$anchor, {
							tabs: [
								{ title: "Github", value: "github" },
								{ title: "Gitlab", value: "gitlab" },
								{ title: "Bitbucket", value: "bitbucket" }
							],
							type: 'secondary',
							get selected() {
								return $.get(tabSecondary);
							},

							set selected($$value) {
								$.set(tabSecondary, $$value, true);
							}
						});
					};

					var node_11 = $.child(div_8);

					demoAndCode(node_11, () => demo, () => tabsSecondary);
					$.reset(div_8);
				}

				$.append($$anchor, fragment_15);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_19 = root_3();
		var node_12 = $.first_child(fragment_19);

		tabs(node_12);

		var node_13 = $.sibling(node_12, 2);

		defaultTabs(node_13);

		var node_14 = $.sibling(node_13, 2);

		disabled(node_14);

		var node_15 = $.sibling(node_14, 2);

		disableSpecific(node_15);

		var node_16 = $.sibling(node_15, 2);

		withIcons(node_16);

		var node_17 = $.sibling(node_16, 2);

		secondary(node_17);

		var node_18 = $.sibling(node_17, 2);

		prevAndNext(node_18);
		$.append($$anchor, fragment_19);
	};

	let selected = $.state("apple");
	let tabDisabled = $.state("apple");
	let tabDisabledSpecific = $.state("apple");
	let tabWithIcons = $.state("github");
	let tabSecondary = $.state("github");

	$.head('xr6tfx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tabs';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}