import * as $ from 'svelte/internal/server';
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

function tabs($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">tabs</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display tab content.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> <div class="overflow-hidden rounded-b-xl">`);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div></div>`);
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "table", href: "/table" },
				next: { title: "text", href: "/text" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let selected = "apple";
	let tabDisabled = "apple";
	let tabDisabledSpecific = "apple";
	let tabWithIcons = "github";
	let tabSecondary = "github";

	function defaultTabs($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Tabs($$renderer, {
						tabs: [
							{ title: "Apple", value: "apple" },
							{ title: "Orange", value: "orange" },
							{ title: "Mango", value: "mango" }
						],

						get selected() {
							return selected;
						},

						set selected($$value) {
							selected = $$value;
							$$settled = false;
						}
					});
				}

				LinkH2($$renderer, {
					href: '/tabs#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, tabsDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function disabled($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Tabs($$renderer, {
						disabled: true,
						tabs: [
							{ title: "Apple", value: "apple" },
							{ title: "Orange", value: "orange" },
							{ title: "Mango", value: "mango" }
						],

						get selected() {
							return tabDisabled;
						},

						set selected($$value) {
							tabDisabled = $$value;
							$$settled = false;
						}
					});
				}

				LinkH2($$renderer, {
					href: '/tabs#disabled',
					'aria-label': 'disabled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->disabled`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, tabsDisabled);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function disableSpecific($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Tabs($$renderer, {
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
							return tabDisabledSpecific;
						},

						set selected($$value) {
							tabDisabledSpecific = $$value;
							$$settled = false;
						}
					});
				}

				LinkH2($$renderer, {
					href: '/tabs#disable-specific-tabs',
					'aria-label': 'disable specific tabs',
					children: ($$renderer) => {
						$$renderer.push(`<!---->disable specific tabs`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, tabsDisabledSpecific);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function withIcons($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Tabs($$renderer, {
						tabs: [
							{ title: "Github", value: "github", icon: LogoGithub },
							{ title: "Gitlab", value: "gitlab", icon: LogoGitlab },
							{
								title: "Bitbucket",
								value: "bitbucket",
								icon: LogoBitbucketColor
							}
						],

						get selected() {
							return tabWithIcons;
						},

						set selected($$value) {
							tabWithIcons = $$value;
							$$settled = false;
						}
					});
				}

				LinkH2($$renderer, {
					href: '/tabs#with-icons',
					'aria-label': 'with-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->with icons`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, tabsWithIcons);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function secondary($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Tabs($$renderer, {
						tabs: [
							{ title: "Github", value: "github" },
							{ title: "Gitlab", value: "gitlab" },
							{ title: "Bitbucket", value: "bitbucket" }
						],
						type: 'secondary',
						get selected() {
							return tabSecondary;
						},

						set selected($$value) {
							tabSecondary = $$value;
							$$settled = false;
						}
					});
				}

				LinkH2($$renderer, {
					href: '/tabs#secondary',
					'aria-label': 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->secondary`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, tabsSecondary);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		tabs($$renderer);
		$$renderer.push(`<!----> `);
		defaultTabs($$renderer);
		$$renderer.push(`<!----> `);
		disabled($$renderer);
		$$renderer.push(`<!----> `);
		disableSpecific($$renderer);
		$$renderer.push(`<!----> `);
		withIcons($$renderer);
		$$renderer.push(`<!----> `);
		secondary($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('xr6tfx', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Tabs</title>`);
			});
		});

		Shell($$renderer, { asideSlot: aside, contSlot: cont });
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}