import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Toaster } from "melt/builders";
import { Progress } from "melt/components";
import { fly } from "svelte/transition";
import Close from "~icons/material-symbols/close-rounded";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div><div></div></div>`);
var root_2 = $.from_html(`<div class="absolute bottom-4 right-4 h-[4px] w-[30px] overflow-hidden rounded-full"><!></div>`);
var root_3 = $.from_html(`<div><h3> </h3> <!> <button><!></button> <!></div>`);

var root_4 = $.from_html(
	`<button class="mx-auto block rounded-xl bg-gray-600 px-4 py-2 font-semibold text-white
				transition-all hover:cursor-pointer hover:bg-gray-500
				active:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
				dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50">Show Toast</button> <div></div>`,
	1
);

export default function Toaster_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		hover: {
			type: "select",
			label: "Hover",
			options: ["pause", "pause-all"],
			defaultValue: "pause-all"
		},
		closeDelay: {
			type: "number",
			min: 0,
			max: 10000,
			defaultValue: 3000,
			label: "Close Delay"
		}
	});

	const toastData = [
		{
			title: "Success",
			description: "Congratulations! It worked!",
			variant: "success"
		},

		{
			title: "Warning",
			description: "Please check again.",
			variant: "warning"
		},

		{
			title: "Error",
			description: "Something did not work!",
			variant: "error"
		}
	];

	const toaster = new Toaster({ ...getters(controls) });

	function addRandomToast() {
		toaster.addToast({
			data: toastData[Math.floor(Math.random() * toastData.length)]
		});
	}

	Preview($$anchor, {
		class: 'text-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var button = $.first_child(fragment_1);
			var div = $.sibling(button, 2);

			$.attribute_effect(
				div,
				() => ({
					...toaster.root,
					class: 'fixed !bottom-4 !right-4 flex w-[300px] flex-col',
					[$.STYLE]: { '--toasts': toaster.toasts.length }
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1n95umn'
			);

			$.each(div, 23, () => toaster.toasts, (toast) => toast.id, ($$anchor, toast, i) => {
				var div_1 = root_3();

				$.attribute_effect(
					div_1,
					() => ({
						class: 'h-(--toast-height) relative flex w-full flex-col justify-center rounded-xl bg-white px-4 text-left transition dark:bg-gray-800',
						...$.get(toast).content,
						[$.STYLE]: { '--n': toaster.toasts.length - $.get(i) }
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1n95umn'
				);

				var h3 = $.child(div_1);

				$.attribute_effect(
					h3,
					() => ({
						...$.get(toast).title,
						class: 'whitespace-nowrap text-sm font-medium'
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1n95umn'
				);

				var text = $.only_child(h3, true);
				var node = $.sibling(h3, 2);

				{
					var consequent = ($$anchor) => {
						var div_2 = root();

						$.attribute_effect(
							div_2,
							() => ({
								...$.get(toast).description,
								class: 'text-xs text-gray-700 dark:text-gray-300'
							}),
							void 0,
							void 0,
							void 0,
							'svelte-1n95umn'
						);

						var text_1 = $.only_child(div_2, true);

						$.template_effect(() => $.set_text(text_1, $.get(toast).data.description));
						$.append($$anchor, div_2);
					};

					$.if(node, ($$render) => {
						if ($.get(toast).data.description) $$render(consequent);
					});
				}

				var button_1 = $.sibling(node, 2);

				$.attribute_effect(
					button_1,
					() => ({
						...$.get(toast).close,
						'aria-label': 'dismiss toast',
						class: 'absolute right-1 top-1 bg-transparent text-gray-300 hover:text-gray-400 dark:hover:text-gray-100'
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1n95umn'
				);

				var node_1 = $.child(button_1);

				Close(node_1, { class: 'h-3.5 w-3.5' });
				$.reset(button_1);

				var node_2 = $.sibling(button_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var div_3 = root_2();
						var node_3 = $.child(div_3);

						{
							const children = ($$anchor, progress = $.noop) => {
								var div_4 = root_1();

								$.attribute_effect(
									div_4,
									() => ({
										...progress().root,
										class: 'relative h-full w-full overflow-hidden bg-gray-200 dark:bg-gray-950'
									}),
									void 0,
									void 0,
									void 0,
									'svelte-1n95umn'
								);

								var div_5 = $.child(div_4);

								$.attribute_effect(
									div_5,
									() => ({
										...progress().progress,
										class: 'h-full w-full -translate-x-[var(--progress)]',
										[$.CLASS]: {
											'bg-green-400': $.get(toast).data.variant === "success",
											'bg-orange-400': $.get(toast).data.variant === "warning",
											'bg-red-500': $.get(toast).data.variant === "error"
										}
									}),
									void 0,
									void 0,
									void 0,
									'svelte-1n95umn'
								);

								$.reset(div_4);
								$.append($$anchor, div_4);
							};

							Progress(node_3, {
								get value() {
									return $.get(toast).percentage;
								},
								children,
								$$slots: { default: true }
							});
						}

						$.reset(div_3);
						$.append($$anchor, div_3);
					};

					$.if(node_2, ($$render) => {
						if ($.get(toast).closeDelay !== 0) $$render(consequent_1);
					});
				}

				$.reset(div_1);
				$.template_effect(() => $.set_text(text, $.get(toast).data.title));
				$.transition(1, div_1, () => fly, () => ({ y: 60, opacity: 0.9 }));
				$.transition(2, div_1, () => fly, () => ({ y: 20 }));
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.delegated('click', button, addRandomToast);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);