import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Rename from '$lib/components/ui/rename';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="flex place-items-center gap-2"><!></div>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"><div class="flex w-[300px] flex-col gap-2 sm:flex-row sm:place-items-center sm:justify-between"><!></div> <p>Value: <span class="font-bold"> </span></p></div>`);

export default function Rename_1($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state('chore: bump deps');
	let mode = $.state('view');
	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => Rename.Provider, ($$anchor, Rename_Provider) => {
		Rename_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Rename.Root, ($$anchor, Rename_Root) => {
					Rename_Root($$anchor, {
						this: 'span',
						validate: (value) => value.length > 0,
						class: 'w-[175px] text-xl',
						onSave: (value) => {
							toast.success(`Saved ${value}`);

							return true;
						},

						get value() {
							return $.get(value);
						},

						set value($$value) {
							$.set(value, $$value, true);
						},

						get mode() {
							return $.get(mode);
						},

						set mode($$value) {
							$.set(mode, $$value, true);
						}
					});
				});

				var div_2 = $.sibling(node_1, 2);
				var node_2 = $.child(div_2);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Rename.Save, ($$anchor, Rename_Save) => {
							Rename_Save($$anchor, { size: 'sm' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Rename.Cancel, ($$anchor, Rename_Cancel) => {
							Rename_Cancel($$anchor, { size: 'sm' });
						});

						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_5 = $.first_child(fragment_2);

						$.component(node_5, () => Rename.Edit, ($$anchor, Rename_Edit) => {
							Rename_Edit($$anchor, { size: 'sm' });
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_2, ($$render) => {
						if ($.get(mode) === 'edit') $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div_2);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var p = $.sibling(div_1, 2);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(value)));
	$.append($$anchor, div);
	$.pop();
}