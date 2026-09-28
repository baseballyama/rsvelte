import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Preview from "@components/preview.svelte";
import { usePreviewControls } from "@components/preview-ctx.svelte";
import { Tabs } from "melt/builders";
import { Debounced, ElementSize, Previous } from "runed";
import Transition from "@components/transition.svelte";

var root = $.from_html(`<div class="media overflow-hidden svelte-1upx803"><img class="h-full w-full rounded-xl object-cover" alt=""/> <p class="absolute bottom-2 left-2 z-10 w-[calc(100%-1rem)] overflow-hidden text-ellipsis
					whitespace-nowrap text-sm font-extrabold text-white sm:left-3 sm:text-xl"> </p></div>`);

var root_1 = $.from_html(`<button><div class="group-focus-visible:ring-accent-600 group-data-[active]:bg-accent-500 overflow-clip rounded-full px-4
						py-1 transition
						group-focus-visible:ring-4 group-[&amp;:not([data-active]):hover]:bg-gray-200
						group-data-[active]:text-white dark:group-[&amp;:not([data-active]):hover]:bg-white/10 dark:group-data-[active]:bg-white dark:group-data-[active]:text-black svelte-1upx803"> </div></button>`);

var root_2 = $.from_html(`<div class="movie-grid svelte-1upx803"><!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<div class="anime-grid svelte-1upx803"><!> <!> <!> <!></div>`);
var root_4 = $.from_html(`<div class="game-grid svelte-1upx803"><!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<div class="music-grid svelte-1upx803"><!> <!> <!> <!></div>`);
var root_6 = $.from_html(`<div><!></div>`);
var root_7 = $.from_html(`<div><div></div> <div><div class="inner"></div></div></div>`);

export default function Tabs_1($$anchor, $$props) {
	$.push($$props, true);

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

	let inner = $.state(void 0);
	const innerSize = new ElementSize(() => $.get(inner));
	let transitioning = $.state(false);
	let activeTab = $.state($.proxy(tabs.value));

	$.user_effect(() => {
		if ($.get(transitioning) || $.get(activeTab) === tabs.value) return;

		$.set(activeTab, tabs.value, true);
		$.set(transitioning, true);
		setTimeout(() => $.set(transitioning, false), 350);
	});

	// Hack to make sure transitions behave
	const debouncedTab = new Debounced(() => $.get(activeTab), 1);

	const previousTab = new Previous(() => $.get(activeTab));

	const forwards = $.derived(() => {
		const prevIndex = tabIds.indexOf(previousTab.current ?? tabIds[0]);
		const currIndex = tabIds.indexOf($.get(activeTab));
		const isLooping = [prevIndex, currIndex].every((i) => i === 0 || i === tabIds.length - 1);

		return isLooping ? prevIndex > currIndex : prevIndex < currIndex;
	});

	const transitionConfigs = $.derived(() => ({
		horizontal: {
			leaveFrom: "-translate-x-1/2 !duration-0",
			leaveTo: `opacity-0 ${$.get(forwards)
				? "translate-x-[calc(-50%-5rem)]"
				: "translate-x-[calc(-50%+5rem)]"}`,
			leave: "absolute left-1/2 duration-300",
			enterFrom: `opacity-0 ${$.get(forwards) ? "translate-x-[5rem]" : "translate-x-[-5rem]"}`,
			enter: "duration-300 relative z-10"
		},
		vertical: {
			leaveFrom: "-translate-y-1/2 !duration-0",
			leaveTo: `opacity-0 ${$.get(forwards)
				? "translate-y-[calc(-50%-5rem)]"
				: "translate-y-[calc(-50%+5rem)]"}`,
			leave: "absolute top-1/2 duration-300",
			enterFrom: `opacity-0 ${$.get(forwards) ? "translate-y-[10rem]" : "translate-y-[-10rem]"}`,
			enter: "duration-300 relative z-10",
			enterTo: "translate-y-0"
		}
	}));

	const transitionConfig = $.derived(() => $.get(transitionConfigs)[tabs.orientation]);

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_7();

			{
				const media = ($$anchor, name = $.noop, src = $.noop) => {
					var div_1 = root();
					var img = $.child(div_1);
					var p = $.sibling(img, 2);
					var text = $.only_child(p, true);

					$.reset(div_1);

					$.template_effect(() => {
						$.set_attribute(img, 'src', src());
						$.set_text(text, name());
					});

					$.append($$anchor, div_1);
				};

				var div_2 = $.child(div);

				$.attribute_effect(
					div_2,
					() => ({
						class: `flex w-full flex-wrap
			${tabs.orientation === 'horizontal'
							? 'items-center justify-center  overflow-x-clip'
							: 'col-span-3 flex-col justify-center overflow-y-clip py-4'}
			`,
						...tabs.triggerList
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1upx803'
				);

				$.each(div_2, 21, () => tabIds, $.index, ($$anchor, id) => {
					var button = root_1();

					$.attribute_effect(
						button,
						($0) => ({
							class: `group min-w-0 max-w-full cursor-pointer text-ellipsis whitespace-nowrap bg-transparent text-start font-medium
					!outline-none transition ${tabs.orientation === 'horizontal' ? 'px-2' : 'py-0.5'}`,
							...$0
						}),
						[() => tabs.getTrigger($.get(id))],
						void 0,
						void 0,
						'svelte-1upx803'
					);

					var div_3 = $.child(button);
					var text_1 = $.only_child(div_3, true);

					$.reset(button);
					$.template_effect(() => $.set_text(text_1, $.get(id)));
					$.append($$anchor, button);
				});

				$.reset(div_2);

				var div_4 = $.sibling(div_2, 2);
				var div_5 = $.child(div_4);

				$.each(div_5, 21, () => tabIds, $.index, ($$anchor, id) => {
					const isActive = $.derived(() => $.get(id) === debouncedTab.current);

					Transition($$anchor, {
						get show() {
							return $.get(isActive);
						},

						get leaveFrom() {
							return $.get(transitionConfig).leaveFrom;
						},

						get leaveTo() {
							return $.get(transitionConfig).leaveTo;
						},

						get leave() {
							return $.get(transitionConfig).leave;
						},

						get enterFrom() {
							return $.get(transitionConfig).enterFrom;
						},

						get enter() {
							return $.get(transitionConfig).enter;
						},

						children: ($$anchor, $$slotProps) => {
							var div_6 = root_6();

							$.attribute_effect(div_6, ($0) => ({ ...$0, class: 'top-0 !block' }), [() => tabs.getContent($.get(id))], void 0, void 0, 'svelte-1upx803');

							var node = $.child(div_6);

							{
								var consequent = ($$anchor) => {
									var div_7 = root_2();
									var node_1 = $.child(div_7);

									media(node_1, () => "Breaking Bad", () => "/previews/breaking-bad.jpg");

									var node_2 = $.sibling(node_1, 2);

									media(node_2, () => "Oldboy", () => "/previews/oldboy.jpg");

									var node_3 = $.sibling(node_2, 2);

									media(node_3, () => "Severance", () => "/previews/severance.jpg");

									var node_4 = $.sibling(node_3, 2);

									media(node_4, () => "The Truman Show", () => "/previews/truman-show.jpg");
									$.reset(div_7);
									$.append($$anchor, div_7);
								};

								var consequent_1 = ($$anchor) => {
									var div_8 = root_3();
									var node_5 = $.child(div_8);

									media(node_5, () => "Attack on Titan", () => "/previews/aot.jpg");

									var node_6 = $.sibling(node_5, 2);

									media(node_6, () => "JJK", () => "/previews/nah-id-win.jpg");

									var node_7 = $.sibling(node_6, 2);

									media(node_7, () => "Solo Leveling", () => "/previews/sung-jinwoo.jpg");

									var node_8 = $.sibling(node_7, 2);

									media(node_8, () => "Berserk", () => "/previews/berserk.avif");
									$.reset(div_8);
									$.append($$anchor, div_8);
								};

								var consequent_2 = ($$anchor) => {
									var div_9 = root_4();
									var node_9 = $.child(div_9);

									media(node_9, () => "Elden Ring", () => "/previews/elden-ring.avif");

									var node_10 = $.sibling(node_9, 2);

									media(node_10, () => "Outer Wilds", () => "/previews/outer-wilds.webp");

									var node_11 = $.sibling(node_10, 2);

									media(node_11, () => "Ultrakill", () => "/previews/ultrakill.jpg");

									var node_12 = $.sibling(node_11, 2);

									media(node_12, () => "Animal Well", () => "/previews/animal-well.jpg");
									$.reset(div_9);
									$.append($$anchor, div_9);
								};

								var consequent_3 = ($$anchor) => {
									var div_10 = root_5();
									var node_13 = $.child(div_10);

									media(node_13, () => "Spiritbox", () => "/previews/spiritbox.jpg");

									var node_14 = $.sibling(node_13, 2);

									media(node_14, () => "Nothing but Thieves", () => "/previews/moral-panic.jpg");

									var node_15 = $.sibling(node_14, 2);

									media(node_15, () => "Deftones", () => "/previews/white-pony.jpg");

									var node_16 = $.sibling(node_15, 2);

									media(node_16, () => "Slipknot", () => "/previews/iowa.jpg");
									$.reset(div_10);
									$.append($$anchor, div_10);
								};

								$.if(node, ($$render) => {
									if ($.get(id) === "Movies & TV") $$render(consequent); else if ($.get(id) === "Anime & Manga") $$render(consequent_1, 1); else if ($.get(id) === "Games") $$render(consequent_2, 2); else if ($.get(id) === "Music") $$render(consequent_3, 3);
								});
							}

							$.reset(div_6);
							$.append($$anchor, div_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_5);
				$.bind_this(div_5, ($$value) => $.set(inner, $$value), () => $.get(inner));
				$.reset(div_4);
				$.reset(div);

				$.template_effect(() => {
					$.set_class(div_4, 1, `relative overflow-visible transition-all duration-300
			${tabs.orientation === 'horizontal' ? '' : 'col-span-9'}`);

					$.set_style(div_4, `height: ${innerSize.height ? `${innerSize.height}px` : 'auto'}`);
				});
			}

			$.template_effect(() => $.set_class(div, 1, `h-[700px] items-center gap-4
		${tabs.orientation === 'horizontal'
				? 'flex flex-col items-center justify-center'
				: 'grid grid-cols-12'}
		`));

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}