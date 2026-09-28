import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Button from "../ui/button/button.svelte";
import { cn } from "$lib/utils";
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
import { scale } from "svelte/transition";
import Code from "$lib/components/ui/code/code.svelte";

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<svg viewBox="0 0 256 308" width="256" height="308" class="size-3.5" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.198 82.198 0 0 0-37.135 55.056 86.566 86.566 0 0 0 8.536 55.576 82.425 82.425 0 0 0-12.296 30.719 87.596 87.596 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.182 82.182 0 0 0 37.135-55.057 86.601 86.601 0 0 0-8.53-55.577 82.409 82.409 0 0 0 12.29-30.718 87.573 87.573 0 0 0-14.963-66.244" fill="#FF3E00"></path><path d="M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.685 52.685 0 0 1-9.003-39.85 49.978 49.978 0 0 1 1.713-6.693l1.35-4.115 3.671 2.697a92.447 92.447 0 0 0 28.036 14.007l2.663.808-.245 2.659a16.067 16.067 0 0 0 2.89 10.656 17.143 17.143 0 0 0 18.397 6.828 15.786 15.786 0 0 0 4.403-1.935l71.67-45.672a14.922 14.922 0 0 0 6.734-9.977 15.923 15.923 0 0 0-2.713-12.011 17.156 17.156 0 0 0-18.404-6.832 15.78 15.78 0 0 0-4.396 1.933l-27.35 17.434a52.298 52.298 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.681 52.681 0 0 1-9.004-39.849 49.428 49.428 0 0 1 22.34-33.114l71.664-45.677a52.218 52.218 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.685 52.685 0 0 1 9.004 39.85 50.559 50.559 0 0 1-1.713 6.692l-1.35 4.116-3.67-2.693a92.373 92.373 0 0 0-28.037-14.013l-2.664-.809.246-2.658a16.099 16.099 0 0 0-2.89-10.656 17.143 17.143 0 0 0-18.398-6.828 15.786 15.786 0 0 0-4.402 1.935l-71.67 45.674a14.898 14.898 0 0 0-6.73 9.975 15.9 15.9 0 0 0 2.709 12.012 17.156 17.156 0 0 0 18.404 6.832 15.841 15.841 0 0 0 4.402-1.935l27.345-17.427a52.147 52.147 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.681 52.681 0 0 1 9.003 39.848 49.453 49.453 0 0 1-22.34 33.12l-71.664 45.673a52.218 52.218 0 0 1-14.563 6.398" fill="#FFF"></path></svg> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex"><div class="hidden w-56 bg-neutral-50 font-mono text-black [--color-background:var(--color-zinc-900)] [--color-foreground:white] [--color-muted:var(--color-zinc-800)] sm:block dark:bg-zinc-900/25 dark:text-white"><div class="pt-1.5 pb-5.5 font-mono"><div><div class="flex items-center gap-1.5 py-2 pr-5.5 pl-4 font-mono text-xs hover:bg-white/5 dark:hover:bg-muted/50"><!> <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 16 16"><path fill="none" stroke="#cad3f5" stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5H12c.83 0 1.5.67 1.5 1.5v.5m-7.5 7H2A1.5 1.5 0 0 1 .5 12V3.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1"></path><path fill="none" stroke="#a6da95" stroke-linecap="round" stroke-linejoin="round" d="M8 10.278c0-.576.468-1.044 1.044-1.044h1.045v-.19a1.044 1.044 0 0 1 2.088 0v.19h1.045c.576 0 1.044.468 1.044 1.044v1.045h.19a1.044 1.044 0 1 1 0 2.088h-.19v1.045c0 .576-.468 1.044-1.044 1.044h-1.045v-.19a1.044 1.044 0 1 0-2.088 0v.19H8v-2.089h.19a1.044 1.044 0 0 0 0-2.088H8Z"></path></svg> <span>components</span></div> <!></div></div></div> <div class="relative min-h-128 w-full sm:w-[calc(100%-14rem)]"><!></div></div>`);
var root_4 = $.from_html(`<div class="relative h-144 sm:w-full"><!></div>`);

export default function CodeEditor($$anchor, $$props) {
	$.push($$props, true);

	const CopyButton = ($$anchor) => {
		Button($$anchor, {
			class: 'absolute top-2 right-2 z-50 h-8 w-8 backdrop-blur-sm',
			variant: 'ghost',
			size: 'icon',
			onclick: copyCode,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var node_1 = $.child(span);

						Check(node_1, { class: 'size-3.5! text-[#10B981]' });
						$.reset(span);
						$.transition(1, span, () => scale);
						$.append($$anchor, span);
					};

					var alternate = ($$anchor) => {
						var span_1 = root();
						var node_2 = $.child(span_1);

						Copy(node_2, { class: 'size-3.5! opacity-50' });
						$.reset(span_1);
						$.transition(1, span_1, () => scale);
						$.append($$anchor, span_1);
					};

					$.if(node, ($$render) => {
						if (clipboard.status === "success") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	};

	let selectedIndex = $.state(0);
	let clipboard = new UseClipboard({ delay: 1500 });

	let copyCode = () => {
		if (Array.isArray($$props.code)) {
			clipboard.copy($$props.code[$.get(selectedIndex)].code);
		} else {
			clipboard.copy($$props.code.code);
		}
	};

	var fragment_2 = $.comment();
	var node_3 = $.first_child(fragment_2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_3();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var node_4 = $.child(div_4);

			ChevronDown(node_4, { class: 'size-4 opacity-50' });

			var svg = $.sibling(node_4, 2);
			var path = $.child(svg);

			$.set_attribute(path, 'stroke-width', 1);

			var path_1 = $.sibling(path);

			$.set_attribute(path_1, 'stroke-width', 1);
			$.reset(svg);
			$.next(2);
			$.reset(div_4);

			var node_5 = $.sibling(div_4, 2);

			$.each(node_5, 17, () => $$props.code, $.index, ($$anchor, item, index) => {
				{
					let $0 = $.derived(() => cn("flex w-full items-center justify-start gap-1.5 rounded-none py-2 pr-5.5 pl-12 text-xs hover:bg-neutral-200/70 hover:dark:bg-zinc-900", $.get(selectedIndex) === index && "bg-neutral-200/70 dark:bg-zinc-800/50"));

					Button($$anchor, {
						get class() {
							return $.get($0);
						},
						variant: 'ghost',
						onclick: () => $.set(selectedIndex, index, true),
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var span_2 = $.sibling($.first_child(fragment_4), 2);
							var text = $.only_child(span_2, true);

							$.template_effect(() => $.set_text(text, $.get(item)?.name || "Untitled"));
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);

			var div_5 = $.sibling(div_1, 2);
			var node_6 = $.child(div_5);

			$.key(node_6, () => $.get(selectedIndex), ($$anchor) => {
				var fragment_5 = root_2();
				var node_7 = $.first_child(fragment_5);

				CopyButton(node_7);

				var node_8 = $.sibling(node_7, 2);

				{
					let $0 = $.derived(() => $$props.code[$.get(selectedIndex)]?.lang || "svelte");
					let $1 = $.derived(() => $$props.code[$.get(selectedIndex)]?.highlight);

					Code(node_8, {
						get lang() {
							return $.get($0);
						},
						class: 'rounded-none border-none!',
						get code() {
							return $$props.code[$.get(selectedIndex)].code;
						},

						get highlight() {
							return $.get($1);
						}
					});
				}

				$.append($$anchor, fragment_5);
			});

			$.reset(div_5);
			$.reset(div);
			$.append($$anchor, div);
		};

		var d = $.derived(() => Array.isArray($$props.code));

		var alternate_1 = ($$anchor) => {
			var div_6 = root_4();
			var node_9 = $.child(div_6);

			{
				let $0 = $.derived(() => $$props.code?.lang || "svelte");
				let $1 = $.derived(() => $$props.code?.highlight);

				Code(node_9, {
					class: 'rounded-none border-none! outline-none',
					get lang() {
						return $.get($0);
					},

					get code() {
						return $$props.code.code;
					},

					get highlight() {
						return $.get($1);
					}
				});
			}

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_3, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}