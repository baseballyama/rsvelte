import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Project from './Project.svelte';
import Comment from './Comment.svelte';

var root = $.from_html(`<p>Those interface tests are now passing.</p>`);
var root_1 = $.from_html(`<div slot="comments"><!></div>`);
var root_2 = $.from_html(`<h1 class="svelte-mv9go9">Projects</h1> <ul class="svelte-mv9go9"><li class="svelte-mv9go9"><!></li> <li class="svelte-mv9go9"><!></li></ul>`, 1);

export default function Optional_slots01_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var ul = $.sibling($.first_child(fragment), 2);
	var li = $.child(ul);
	var node = $.child(li);

	Project(node, {
		title: 'Add Typescript support',
		tasksCompleted: 25,
		totalTasks: 57,
		$$slots: {
			comments: ($$anchor, $$slotProps) => {
				var div = root_1();
				var node_1 = $.child(div);

				Comment(node_1, {
					name: 'Ecma Script',
					postedAt: new Date('2020-08-17T14:12:23'),
					children: ($$anchor, $$slotProps) => {
						var p = root();

						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_2 = $.child(li_1);

	Project(node_2, {
		title: 'Update documentation',
		tasksCompleted: 18,
		totalTasks: 21
	});

	$.reset(li_1);
	$.reset(ul);
	$.append($$anchor, fragment);
	$.pop();
}