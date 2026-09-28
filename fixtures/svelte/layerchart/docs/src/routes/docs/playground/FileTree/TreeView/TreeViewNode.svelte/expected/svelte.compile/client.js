import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';
import { cls } from '@layerstack/tailwind';
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
import VscodeIconsFileTypeJavascript from '~icons/vscode-icons/file-type-js';
import VscodeIconsFileTypeCss from '~icons/vscode-icons/file-type-css';
import File from '~icons/lucide/file';
import Folder from '~icons/lucide/folder';
import FolderOpen from '~icons/lucide/folder-open';
import { Icon } from 'svelte-ux';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'path',
	'open',
	'selected',
	'onSelect',
	'class',
	'icon',
	'children',
	'type',
	'onclick'
]);

var root = $.from_html(`<button><!> <span> </span></button>`);
var root_1 = $.from_html(`<div class="mx-2 border-l"><div class="relative flex place-items-start"><div class="bg-border mx-2 h-full w-px"></div> <div class="flex flex-col"><!></div></div></div>`);
var root_2 = $.from_html(`<div><button type="button"><!> <span class="group-hover/folder:text-primary/80"> </span></button> <!></div>`);

export default function TreeViewNode($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, true),
		selected = $.prop($$props, 'selected', 3, false),
		type = $.prop($$props, 'type', 3, 'button'),
		rest = $.rest_props($$props, rest_excludes);

	function handleClick() {
		if ($$props.path && $$props.onSelect) {
			$$props.onSelect($$props.path);
		}
	}

	function toggleOpen() {
		open(!open());
	}

	let fileIcon = $.derived(() => {
		if ($$props.name.endsWith('.svelte')) {
			return VscodeIconsFileTypeSvelte;
		} else if ($$props.name.endsWith('.ts')) {
			return VscodeIconsFileTypeTypescript;
		} else if ($$props.name.endsWith('.js')) {
			return VscodeIconsFileTypeJavascript;
		} else if ($$props.name.endsWith('.css')) {
			return VscodeIconsFileTypeCss;
		} else {
			return File;
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, ($0) => ({ type: type(), class: $0, onclick: handleClick, ...rest }), [
				() => cls('flex place-items-center gap-2 pl-[3px] hover:text-primary/80', selected() && 'text-primary/80 group-hover:text-inherit', $$props.class)
			]);

			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.icon, () => ({ name: $$props.name, open: open() }));
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					Icon($$anchor, {
						get data() {
							return $.get(fileIcon);
						},
						class: 'size-4'
					});
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(button);
			$.template_effect(() => $.set_text(text, $$props.name));
			$.append($$anchor, button);
		};

		var d = $.derived(() => $$props.name.includes('.'));

		var alternate_2 = ($$anchor) => {
			var div = root_2();
			var button_1 = $.child(div);
			var node_3 = $.child(button_1);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.snippet(node_4, () => $$props.icon, () => ({ name: $$props.name, open: open() }));
					$.append($$anchor, fragment_3);
				};

				var consequent_3 = ($$anchor) => {
					FolderOpen($$anchor, { class: 'size-4 text-surface-content' });
				};

				var alternate_1 = ($$anchor) => {
					Folder($$anchor, { class: 'size-4 text-surface-content' });
				};

				$.if(node_3, ($$render) => {
					if ($$props.icon) $$render(consequent_2); else if (open()) $$render(consequent_3, 1); else $$render(alternate_1, -1);
				});
			}

			var span_1 = $.sibling(node_3, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(button_1);

			var node_5 = $.sibling(button_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_1 = root_1();
					var div_2 = $.child(div_1);
					var div_3 = $.sibling($.child(div_2), 2);
					var node_6 = $.child(div_3);

					$.snippet(node_6, () => $$props.children ?? $.noop);
					$.reset(div_3);
					$.reset(div_2);
					$.reset(div_1);
					$.transition(3, div_1, () => slide, () => ({ duration: 150 }));
					$.append($$anchor, div_1);
				};

				$.if(node_5, ($$render) => {
					if (open()) $$render(consequent_4);
				});
			}

			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_class(button_1, 1, $0);
					$.set_text(text_1, $$props.name);
				},
				[
					() => $.clsx(cls('flex place-items-center gap-2 group/folder', $$props.class))
				]
			);

			$.delegated('click', button_1, toggleOpen);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);