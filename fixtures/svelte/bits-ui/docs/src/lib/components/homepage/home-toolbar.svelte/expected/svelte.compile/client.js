import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar } from "bits-ui";
import WaveSine from "phosphor-svelte/lib/WaveSine";
import WaveSquare from "phosphor-svelte/lib/WaveSquare";
import WaveTriangle from "phosphor-svelte/lib/WaveTriangle";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Home_toolbar($$anchor) {
	let wave = $.state("sine");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Toolbar.Root, ($$anchor, Toolbar_Root) => {
		Toolbar_Root($$anchor, {
			class: 'bg-background-alt flex h-7 w-min items-center rounded-[5px] px-[3px] lg:h-10 lg:rounded-[7px] lg:px-[4px] dark:bg-white',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Toolbar.Group, ($$anchor, Toolbar_Group) => {
					Toolbar_Group($$anchor, {
						type: 'single',
						class: 'inline-flex items-center gap-x-0.5',
						get value() {
							return $.get(wave);
						},

						set value($$value) {
							$.set(wave, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem) => {
								Toolbar_GroupItem($$anchor, {
									'aria-label': 'wave sine',
									value: 'sine',
									class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8  dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
									children: ($$anchor, $$slotProps) => {
										WaveSine($$anchor, { class: 'size-[14px] lg:size-5' });
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_1) => {
								Toolbar_GroupItem_1($$anchor, {
									'aria-label': 'wave square',
									value: 'square',
									class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8 dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
									children: ($$anchor, $$slotProps) => {
										WaveSquare($$anchor, { class: 'size-[14px] lg:size-5' });
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_2) => {
								Toolbar_GroupItem_2($$anchor, {
									'aria-label': 'wave triangle',
									value: 'triangle',
									class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground  data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8 dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
									children: ($$anchor, $$slotProps) => {
										WaveTriangle($$anchor, { class: 'size-[14px] lg:size-5' });
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}