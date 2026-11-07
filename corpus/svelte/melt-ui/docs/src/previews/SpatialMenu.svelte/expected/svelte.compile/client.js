import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters, mergeAttrs } from "melt";
import { SpatialMenu } from "melt/builders";
import { movies } from "./movies";
import fuzzysearch from "./utils/search";
import IconHeart from "~icons/solar/heart-bold";
import IconDisabled from "~icons/lucide/circle-slash";

var root = $.from_html(`<div><div><img/> <div></div> <!> <!></div> <span> </span></div>`);
var root_1 = $.from_html(`<div class="shrink-1 movie-list-mask min-h-0 w-[30rem] flex-1 overflow-y-auto px-2 py-4 svelte-9l4vau"><div class="grid gap-4 p-2"></div></div>`);
var root_2 = $.from_html(`<div class="mt-4 flex flex-col items-center justify-center gap-1 p-2"><div class="text-center text-sm font-medium">No movies found</div> <div class="text-center text-xs text-gray-500">Try adjusting your search terms</div></div>`);
var root_3 = $.from_html(`<div><label class="focus-within:border-accent-500 w-64 border-b-2 border-gray-800 transition"><input/></label> <!></div>`);

export default function SpatialMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		wrap: { type: "boolean", defaultValue: false, label: "Wrap Around" },
		crossAxis: { type: "boolean", defaultValue: false, label: "Cross Axis" }
	});

	const spatialMenu = new SpatialMenu({ ...getters(controls) });
	let search = $.state("");
	const filtered = $.derived(() => fuzzysearch({ needle: $.get(search), haystack: movies, property: "title" }));
	const selected = $.proxy([]);
	const disabled = $.proxy([]);

	function toggle(arr, value) {
		const index = arr.findIndex((i) => i === value);

		if (index === -1) arr.push(value); else arr.splice(index, 1);
	}

	function remove(arr, value) {
		const index = arr.findIndex((i) => i === value);

		if (index !== -1) arr.splice(index, 1);
	}

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_3();

			$.attribute_effect(
				div,
				() => ({
					class: 'h-140 mx-auto flex flex-col items-center gap-3 overflow-hidden p-2',
					...spatialMenu.root
				}),
				void 0,
				void 0,
				void 0,
				'svelte-9l4vau'
			);

			var label = $.child(div);
			var input = $.child(label);

			$.attribute_effect(
				input,
				() => ({
					class: 'w-full bg-transparent !outline-none',
					placeholder: 'Search for movies',
					...spatialMenu.input
				}),
				void 0,
				void 0,
				void 0,
				'svelte-9l4vau',
				true
			);

			$.reset(label);

			var node = $.sibling(label, 2);

			{
				var consequent = ($$anchor) => {
					var div_1 = root_1();
					var div_2 = $.child(div_1);

					$.set_style(div_2, '', {}, {
						'grid-template-columns': 'repeat(auto-fill,minmax(100px,1fr))'
					});

					$.each(div_2, 21, () => $.get(filtered), $.index, ($$anchor, movie) => {
						const isDisabled = $.derived(() => Boolean(disabled.find((i) => i === $.get(movie).title)));

						const item = $.derived(() => spatialMenu.getItem($.get(movie), {
							onSelect: () => toggle(selected, $.get(movie).title),
							disabled: $.get(isDisabled)
						}));

						const isSelected = $.derived(() => selected.find((i) => i === $.get(movie).title));
						var div_3 = root();

						$.attribute_effect(
							div_3,
							($0) => ({
								class: [
									" flex w-full scroll-mb-8 scroll-mt-14 flex-col gap-2 transition",
									$.get(item).highlighted && "scale-105"
								],
								...$0
							}),
							[
								() => mergeAttrs($.get(item).attrs, {
									onclick: (e) => {
										const isAltKeyPressed = e.altKey;

										if (isAltKeyPressed) {
											toggle(disabled, $.get(movie).title);
											remove(selected, $.get(movie).title);
										}
									}
								})
							],
							void 0,
							void 0,
							'svelte-9l4vau'
						);

						var div_4 = $.child(div_3);
						var img = $.child(div_4);

						$.set_class(img, 1, $.clsx(["object-fit h-full w-full"]));

						var div_5 = $.sibling(img, 2);
						var node_1 = $.sibling(div_5, 2);

						{
							let $0 = $.derived(() => [
								"absolute bottom-1 right-1 text-white",
								"drop-shadow-xs transition",
								$.get(isSelected) ? "scale-100" : "scale-75 opacity-0"
							]);

							IconHeart(node_1, {
								get class() {
									return $.get($0);
								}
							});
						}

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => [
								"absolute bottom-1 right-1 text-white",
								"drop-shadow-xs transition",
								$.get(isDisabled) ? "scale-100" : "scale-75 opacity-0"
							]);

							IconDisabled(node_2, {
								get class() {
									return $.get($0);
								}
							});
						}

						$.reset(div_4);

						var span = $.sibling(div_4, 2);
						var text = $.only_child(span, true);

						$.reset(div_3);

						$.template_effect(() => {
							$.set_class(div_4, 1, $.clsx([
								"relative overflow-hidden rounded-md outline-2 outline-offset-2 transition-all",
								$.get(item).highlighted ? "outline-accent-500 " : "!outline-transparent",
								$.get(item).disabled ? "opacity-50" : ""
							]));

							$.set_attribute(img, 'src', $.get(movie).posterUrl);
							$.set_attribute(img, 'alt', $.get(movie).title);

							$.set_class(div_5, 1, $.clsx([
								"absolute -bottom-2 -right-2 h-10 w-12 rounded-md transition",
								"bg-gradient-to-br from-transparent via-neutral-900/45 via-30% to-neutral-900/45 blur-sm",
								!$.get(isSelected) && "opacity-0"
							]));

							$.set_class(span, 1, $.clsx([
								"text-center text-xs font-medium transition",
								$.get(item).highlighted
									? "text-accent-500 dark:text-accent-200"
									: "text-gray-800 dark:text-gray-200"
							]));

							$.set_text(text, $.get(movie).title);
						});

						$.append($$anchor, div_3);
					});

					$.reset(div_2);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				var alternate = ($$anchor) => {
					var div_6 = root_2();

					$.append($$anchor, div_6);
				};

				$.if(node, ($$render) => {
					if ($.get(filtered).length) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.bind_value(input, () => $.get(search), ($$value) => $.set(search, $$value));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}