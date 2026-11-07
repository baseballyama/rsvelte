import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from "./index";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import { Svelte, TypeScript, Terminal } from "$lib/components/icons";

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<div class="no-scrollbar flex overflow-auto rounded-md border"><div class="no-scrollbar hidden min-w-54 overflow-auto rounded-tl-md border-r bg-neutral-50 font-mono text-black [--color-background:var(--color-zinc-900)] [--color-foreground:white] [--color-muted:var(--color-zinc-800)] sm:block dark:bg-zinc-900/25 dark:text-white"><div><div class="flex items-center gap-1.5 py-2 pr-5.5 pl-4 font-mono text-xs hover:bg-white/5 dark:hover:bg-muted/50"><svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 16 16"><path fill="none" stroke="#cad3f5" stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5H12c.83 0 1.5.67 1.5 1.5v.5m-7.5 7H2A1.5 1.5 0 0 1 .5 12V3.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1"></path><path fill="none" stroke="#a6da95" stroke-linecap="round" stroke-linejoin="round" d="M8 10.278c0-.576.468-1.044 1.044-1.044h1.045v-.19a1.044 1.044 0 0 1 2.088 0v.19h1.045c.576 0 1.044.468 1.044 1.044v1.045h.19a1.044 1.044 0 1 1 0 2.088h-.19v1.045c0 .576-.468 1.044-1.044 1.044h-1.045v-.19a1.044 1.044 0 1 0-2.088 0v.19H8v-2.089h.19a1.044 1.044 0 0 0 0-2.088H8Z"></path></svg> <span>components</span></div> <!></div></div> <div class="relative no-scrollbar max-h-[550px] min-h-[32rem] w-full overflow-auto border-none sm:w-full"><!></div></div>`);

export default function Multiple_code($$anchor, $$props) {
	$.push($$props, true);

	let selectedIndex = $.state(0);
	let selectedCode = $.derived(() => $$props.code[$.get(selectedIndex)]);
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var svg = $.child(div_3);
	var path = $.child(svg);

	$.set_attribute(path, 'stroke-width', 1);

	var path_1 = $.sibling(path);

	$.set_attribute(path_1, 'stroke-width', 1);
	$.reset(svg);
	$.next(2);
	$.reset(div_3);

	var node = $.sibling(div_3, 2);

	$.each(node, 17, () => $$props.code, $.index, ($$anchor, item, index) => {
		{
			let $0 = $.derived(() => cn(`flex w-full items-center justify-start gap-1.5 rounded-none border-l-2 border-transparent pl-6! text-xs hover:bg-neutral-200/70 hover:dark:bg-zinc-900 [&_svg:not([class*='size-'])]:size-3`, $.get(selectedIndex) === index && "border-l-2 border-muted-foreground bg-neutral-200/40 dark:bg-zinc-800/50"));

			Button($$anchor, {
				get class() {
					return $.get($0);
				},
				variant: 'ghost',
				onclick: () => $.set(selectedIndex, index, true),
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							Svelte($$anchor, { class: 'size-3' });
						};

						var consequent_1 = ($$anchor) => {
							TypeScript($$anchor, { class: 'size-3' });
						};

						var alternate = ($$anchor) => {
							Terminal($$anchor, { class: 'size-3' });
						};

						$.if(node_1, ($$render) => {
							if ($.get(item).lang === "svelte") $$render(consequent); else if ($.get(item).lang === "typescript") $$render(consequent_1, 1); else $$render(alternate, -1);
						});
					}

					var span = $.sibling(node_1, 2);
					var text = $.only_child(span, true);

					$.template_effect(() => {
						$.set_class(span, 1, $.clsx([
							"transition-all duration-200",
							$.get(selectedIndex) === index
								? "!text-black dark:!text-white"
								: "text-muted-foreground"
						]));

						$.set_text(text, $.get(item)?.filename || "Svelte");
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_2 = $.child(div_4);

	$.component(node_2, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, {
			get lang() {
				return $.get(selectedCode).lang;
			},
			class: 'relative no-scrollbar w-full rounded-none border-none',
			get code() {
				return $.get(selectedCode).filecode;
			},

			get highlight() {
				return $.get(selectedCode).highlight;
			},

			get hideLines() {
				return $.get(selectedCode).hideLines;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				$.component(node_3, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
					Code_CopyButton($$anchor, {});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}