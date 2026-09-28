import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronRight, Folder, FolderOpen } from 'lucide-svelte';
import Self from './Directory.svelte';
import File from './File.svelte';

var root = $.from_html(`<button><div class="*:w-[1em]"><!></div> <!></button>`);
var root_1 = $.from_html(`<li class="my-1 list-outside pl-0"><!></li>`);
var root_2 = $.from_html(`<!> <ul></ul>`, 1);

export default function Directory($$anchor, $$props) {
	$.push($$props, true);

	let showDirectoryName = $.prop($$props, 'showDirectoryName', 3, true),
		expanded = $.prop($$props, 'expanded', 15, true);

	const sortedFiles = $.derived(() => $$props.directory.files.sort((a, b) => {
		if (a.type === 'directory' && b.type === 'file') {
			return -1;
		} else if (a.type === 'file' && b.type === 'directory') {
			return 1;
		} else {
			return a.name.localeCompare(b.name);
		}
	}));

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();
			let classes;
			var div = $.child(button);
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					FolderOpen($$anchor, {});
				};

				var alternate = ($$anchor) => {
					Folder($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (expanded()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div);

			var text = $.sibling(div);
			var node_2 = $.sibling(text);

			{
				let $0 = $.derived(() => `ml-1 h-[1em] w-[1em] translate-y-px rotate-0 transition-all duration-200 ${expanded() ? '-translate-y-px rotate-90' : ''}`);

				ChevronRight(node_2, {
					get class() {
						return $.get($0);
					},
					'aria-hidden': 'true'
				});
			}

			$.reset(button);

			$.template_effect(() => {
				classes = $.set_class(button, 1, 'flex flex-row items-center gap-1 font-bold', null, classes, { expanded: expanded() });
				$.set_text(text, ` ${$$props.directory.name ?? ''} `);
			});

			$.delegated('click', button, () => {
				expanded(!expanded());
			});

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (showDirectoryName()) $$render(consequent_1);
		});
	}

	var ul = $.sibling(node, 2);

	$.each(ul, 21, () => $.get(sortedFiles), $.index, ($$anchor, file) => {
		var li = root_1();
		var node_3 = $.child(li);

		{
			var consequent_2 = ($$anchor) => {
				Self($$anchor, {
					get directory() {
						return $.get(file);
					}
				});
			};

			var alternate_1 = ($$anchor) => {
				File($$anchor, {
					get file() {
						return $.get(file);
					}
				});
			};

			$.if(node_3, ($$render) => {
				if ($.get(file).type === 'directory') $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);

	$.template_effect(() => $.set_class(ul, 1, $.clsx([
		'list-none',
		!expanded() && 'hidden',
		showDirectoryName() && 'ml-1.5 border-l border-white/20 pl-3'
	])));

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);