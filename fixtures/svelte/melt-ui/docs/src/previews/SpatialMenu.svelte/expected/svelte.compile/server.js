import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters, mergeAttrs } from "melt";
import { SpatialMenu } from "melt/builders";
import { movies } from "./movies";
import fuzzysearch from "./utils/search";
import IconHeart from "~icons/solar/heart-bold";
import IconDisabled from "~icons/lucide/circle-slash";

export default function SpatialMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			wrap: { type: "boolean", defaultValue: false, label: "Wrap Around" },
			crossAxis: { type: "boolean", defaultValue: false, label: "Cross Axis" }
		});

		const spatialMenu = new SpatialMenu({ ...getters(controls) });
		let search = "";
		const filtered = $.derived(() => fuzzysearch({ needle: search, haystack: movies, property: "title" }));
		const selected = [];
		const disabled = [];

		function toggle(arr, value) {
			const index = arr.findIndex((i) => i === value);

			if (index === -1) arr.push(value); else arr.splice(index, 1);
		}

		function remove(arr, value) {
			const index = arr.findIndex((i) => i === value);

			if (index !== -1) arr.splice(index, 1);
		}

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes(
					{
						class: 'h-140 mx-auto flex flex-col items-center gap-3 overflow-hidden p-2',
						...spatialMenu.root
					},
					'svelte-9l4vau'
				)}><label class="focus-within:border-accent-500 w-64 border-b-2 border-gray-800 transition"><input${$.attributes(
					{
						class: 'w-full bg-transparent !outline-none',
						value: search,
						placeholder: 'Search for movies',
						...spatialMenu.input
					},
					'svelte-9l4vau',
					void 0,
					void 0,
					4
				)}/></label> `);

				if (filtered().length) {
					$$renderer.push(`<!--[0--><div class="shrink-1 movie-list-mask min-h-0 w-[30rem] flex-1 overflow-y-auto px-2 py-4 svelte-9l4vau"><div class="grid gap-4 p-2"${$.attr_style('', {
						'grid-template-columns': 'repeat(auto-fill,minmax(100px,1fr))'
					})}><!--[-->`);

					const each_array = $.ensure_array_like(filtered());

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let movie = each_array[$$index];
						const isDisabled = Boolean(disabled.find((i) => i === movie.title));

						const item = spatialMenu.getItem(movie, {
							onSelect: () => toggle(selected, movie.title),
							disabled: isDisabled
						});

						const isSelected = selected.find((i) => i === movie.title);

						$$renderer.push(`<div${$.attributes(
							{
								class: $.clsx([
									" flex w-full scroll-mb-8 scroll-mt-14 flex-col gap-2 transition",
									item.highlighted && "scale-105"
								]),

								...mergeAttrs(item.attrs, {
									onclick: (e) => {
										const isAltKeyPressed = e.altKey;

										if (isAltKeyPressed) {
											toggle(disabled, movie.title);
											remove(selected, movie.title);
										}
									}
								})
							},
							'svelte-9l4vau'
						)}><div${$.attr_class($.clsx([
							"relative overflow-hidden rounded-md outline-2 outline-offset-2 transition-all",
							item.highlighted ? "outline-accent-500 " : "!outline-transparent",
							item.disabled ? "opacity-50" : ""
						]))}><img${$.attr_class($.clsx(["object-fit h-full w-full"]))}${$.attr('src', movie.posterUrl)}${$.attr('alt', movie.title)}/> <div${$.attr_class($.clsx([
							"absolute -bottom-2 -right-2 h-10 w-12 rounded-md transition",
							"bg-gradient-to-br from-transparent via-neutral-900/45 via-30% to-neutral-900/45 blur-sm",
							!isSelected && "opacity-0"
						]))}></div> `);

						IconHeart($$renderer, {
							class: [
								"absolute bottom-1 right-1 text-white",
								"drop-shadow-xs transition",
								isSelected ? "scale-100" : "scale-75 opacity-0"
							]
						});

						$$renderer.push(`<!----> `);

						IconDisabled($$renderer, {
							class: [
								"absolute bottom-1 right-1 text-white",
								"drop-shadow-xs transition",
								isDisabled ? "scale-100" : "scale-75 opacity-0"
							]
						});

						$$renderer.push(`<!----></div> <span${$.attr_class($.clsx([
							"text-center text-xs font-medium transition",
							item.highlighted
								? "text-accent-500 dark:text-accent-200"
								: "text-gray-800 dark:text-gray-200"
						]))}>${$.escape(movie.title)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="mt-4 flex flex-col items-center justify-center gap-1 p-2"><div class="text-center text-sm font-medium">No movies found</div> <div class="text-center text-xs text-gray-500">Try adjusting your search terms</div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}