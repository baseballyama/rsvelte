import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TypeScript } from "$lib/components/icons";
import { Svelte, Terminal, CSS, Markdown } from "$lib/components/icons";
import * as Code from "$lib/components/ui/code";
import CopyButton from "../copy-button/copy-button.svelte";

var root = $.from_html(`<div class="w-full"><div class="overflow-hidden rounded-lg border border-border"><div class="flex items-center justify-between border-b border-border py-1 pr-1 pl-4"><div class="flex items-center gap-1.5"><!> <span class="text-sm font-normal"> </span></div> <div><!></div></div> <!></div></div>`);

export default function Single_code_filename($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			Svelte($$anchor, {});
		};

		var consequent_1 = ($$anchor) => {
			TypeScript($$anchor, {});
		};

		var consequent_2 = ($$anchor) => {
			CSS($$anchor, {});
		};

		var consequent_3 = ($$anchor) => {
			Markdown($$anchor, {});
		};

		var alternate = ($$anchor) => {
			Terminal($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($$props.code.lang === "svelte") $$render(consequent); else if ($$props.code.lang === "typescript") $$render(consequent_1, 1); else if ($$props.code.lang === "css") $$render(consequent_2, 2); else if ($$props.code.lang === "markdown") $$render(consequent_3, 3); else $$render(alternate, -1);
		});
	}

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	CopyButton(node_1, {
		get text() {
			return $$props.code.filecode;
		}
	});

	$.reset(div_4);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_3 = $.first_child(fragment_5);

			$.component(node_3, () => Code.Overflow, ($$anchor, Code_Overflow) => {
				Code_Overflow($$anchor, {
					collapsed: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_4 = $.first_child(fragment_6);

						$.component(node_4, () => Code.Root, ($$anchor, Code_Root) => {
							Code_Root($$anchor, {
								get lang() {
									return $$props.code.lang;
								},
								class: 'w-full rounded-none border-none',
								get code() {
									return $$props.code.filecode;
								},

								get highlight() {
									return $$props.code.highlight;
								},

								get hideLines() {
									return $$props.code.hideLines;
								}
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_5 = $.first_child(fragment_7);

			$.component(node_5, () => Code.Root, ($$anchor, Code_Root_1) => {
				Code_Root_1($$anchor, {
					get lang() {
						return $$props.code.lang;
					},
					class: 'w-full rounded-none border-none',
					get code() {
						return $$props.code.filecode;
					},

					get highlight() {
						return $$props.code.highlight;
					},

					get hideLines() {
						return $$props.code.hideLines;
					}
				});
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_2, ($$render) => {
			if ($$props.code.isExpand) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.code.filename));
	$.append($$anchor, div);
	$.pop();
}