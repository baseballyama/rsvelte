import * as $ from 'svelte/internal/server';
import Preview from "@components/preview.svelte";
import { usePreviewControls } from "@components/preview-ctx.svelte";
import { Tabs } from "melt/builders";
import { Debounced, ElementSize, Previous } from "runed";
import Transition from "@components/transition.svelte";

export default function Tabs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			loop: { label: "Loop", defaultValue: true, type: "boolean" },
			selectWhenFocused: {
				label: "Select when focused",
				defaultValue: true,
				type: "boolean"
			},
			orientation: {
				label: "Orientation",
				defaultValue: "horizontal",
				type: "select",
				options: ["horizontal", "vertical"]
			}
		});

		const tabIds = ["Movies & TV", "Anime & Manga", "Games", "Music"];

		const tabs = new Tabs({
			value: "Movies & TV",
			loop: () => controls.loop,
			selectWhenFocused: () => controls.selectWhenFocused,
			orientation: () => controls.orientation
		});

		let inner = void 0;
		const innerSize = new ElementSize(() => inner);
		let transitioning = false;
		let activeTab = tabs.value;

		// Hack to make sure transitions behave
		const debouncedTab = new Debounced(() => activeTab, 1);

		const previousTab = new Previous(() => activeTab);

		const forwards = $.derived(() => {
			const prevIndex = tabIds.indexOf(previousTab.current ?? tabIds[0]);
			const currIndex = tabIds.indexOf(activeTab);
			const isLooping = [prevIndex, currIndex].every((i) => i === 0 || i === tabIds.length - 1);

			return isLooping ? prevIndex > currIndex : prevIndex < currIndex;
		});

		const transitionConfigs = $.derived(() => ({
			horizontal: {
				leaveFrom: "-translate-x-1/2 !duration-0",
				leaveTo: `opacity-0 ${forwards()
					? "translate-x-[calc(-50%-5rem)]"
					: "translate-x-[calc(-50%+5rem)]"}`,
				leave: "absolute left-1/2 duration-300",
				enterFrom: `opacity-0 ${forwards() ? "translate-x-[5rem]" : "translate-x-[-5rem]"}`,
				enter: "duration-300 relative z-10"
			},
			vertical: {
				leaveFrom: "-translate-y-1/2 !duration-0",
				leaveTo: `opacity-0 ${forwards()
					? "translate-y-[calc(-50%-5rem)]"
					: "translate-y-[calc(-50%+5rem)]"}`,
				leave: "absolute top-1/2 duration-300",
				enterFrom: `opacity-0 ${forwards() ? "translate-y-[10rem]" : "translate-y-[-10rem]"}`,
				enter: "duration-300 relative z-10",
				enterTo: "translate-y-0"
			}
		}));

		const transitionConfig = $.derived(() => transitionConfigs()[tabs.orientation]);

		Preview($$renderer, {
			children: ($$renderer) => {
				function media($$renderer, name, src) {
					$$renderer.push(`<div class="media overflow-hidden svelte-1upx803"><img class="h-full w-full rounded-xl object-cover"${$.attr('src', src)} alt=""/> <p class="absolute bottom-2 left-2 z-10 w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-white sm:left-3 sm:text-xl">${$.escape(name)}</p></div>`);
				}

				$$renderer.push(`<div${$.attr_class(`h-[700px] items-center gap-4 ${tabs.orientation === 'horizontal'
					? 'flex flex-col items-center justify-center'
					: 'grid grid-cols-12'} `)}><div${$.attributes(
					{
						class: `flex w-full flex-wrap ${tabs.orientation === 'horizontal'
							? 'items-center justify-center  overflow-x-clip'
							: 'col-span-3 flex-col justify-center overflow-y-clip py-4'} `,
						...tabs.triggerList
					},
					'svelte-1upx803'
				)}><!--[-->`);

				const each_array = $.ensure_array_like(tabIds);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let id = each_array[$$index];

					$$renderer.push(`<button${$.attributes(
						{
							class: `group min-w-0 max-w-full cursor-pointer text-ellipsis whitespace-nowrap bg-transparent text-start font-medium !outline-none transition ${tabs.orientation === 'horizontal' ? 'px-2' : 'py-0.5'}`,
							...tabs.getTrigger(id)
						},
						'svelte-1upx803'
					)}><div class="group-focus-visible:ring-accent-600 group-data-[active]:bg-accent-500 overflow-clip rounded-full px-4 py-1 transition group-focus-visible:ring-4 group-[&amp;:not([data-active]):hover]:bg-gray-200 group-data-[active]:text-white dark:group-[&amp;:not([data-active]):hover]:bg-white/10 dark:group-data-[active]:bg-white dark:group-data-[active]:text-black svelte-1upx803">${$.escape(id)}</div></button>`);
				}

				$$renderer.push(`<!--]--></div> <div${$.attr_class(`relative overflow-visible transition-all duration-300 ${tabs.orientation === 'horizontal' ? '' : 'col-span-9'}`)}${$.attr_style(`height: ${innerSize.height ? `${innerSize.height}px` : 'auto'}`)}><div class="inner"><!--[-->`);

				const each_array_1 = $.ensure_array_like(tabIds);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let id = each_array_1[$$index_1];
					const isActive = id === debouncedTab.current;

					Transition($$renderer, {
						show: isActive,
						leaveFrom: transitionConfig().leaveFrom,
						leaveTo: transitionConfig().leaveTo,
						leave: transitionConfig().leave,
						enterFrom: transitionConfig().enterFrom,
						enter: transitionConfig().enter,
						children: ($$renderer) => {
							$$renderer.push(`<div${$.attributes({ ...tabs.getContent(id), class: 'top-0 !block' }, 'svelte-1upx803')}>`);

							if (id === "Movies & TV") {
								$$renderer.push(`<!--[0--><div class="movie-grid svelte-1upx803">`);
								media($$renderer, "Breaking Bad", "/previews/breaking-bad.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Oldboy", "/previews/oldboy.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Severance", "/previews/severance.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "The Truman Show", "/previews/truman-show.jpg");
								$$renderer.push(`<!----></div>`);
							} else if (id === "Anime & Manga") {
								$$renderer.push(`<!--[1--><div class="anime-grid svelte-1upx803">`);
								media($$renderer, "Attack on Titan", "/previews/aot.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "JJK", "/previews/nah-id-win.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Solo Leveling", "/previews/sung-jinwoo.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Berserk", "/previews/berserk.avif");
								$$renderer.push(`<!----></div>`);
							} else if (id === "Games") {
								$$renderer.push(`<!--[2--><div class="game-grid svelte-1upx803">`);
								media($$renderer, "Elden Ring", "/previews/elden-ring.avif");
								$$renderer.push(`<!----> `);
								media($$renderer, "Outer Wilds", "/previews/outer-wilds.webp");
								$$renderer.push(`<!----> `);
								media($$renderer, "Ultrakill", "/previews/ultrakill.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Animal Well", "/previews/animal-well.jpg");
								$$renderer.push(`<!----></div>`);
							} else if (id === "Music") {
								$$renderer.push(`<!--[3--><div class="music-grid svelte-1upx803">`);
								media($$renderer, "Spiritbox", "/previews/spiritbox.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Nothing but Thieves", "/previews/moral-panic.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Deftones", "/previews/white-pony.jpg");
								$$renderer.push(`<!----> `);
								media($$renderer, "Slipknot", "/previews/iowa.jpg");
								$$renderer.push(`<!----></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}