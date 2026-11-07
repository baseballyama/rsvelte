import * as $ from 'svelte/internal/server';
import Project from './Project.svelte';
import Comment from './Comment.svelte';

export default function Optional_slots01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1 class="svelte-mv9go9">Projects</h1> <ul class="svelte-mv9go9"><li class="svelte-mv9go9">`);

		Project($$renderer, {
			title: 'Add Typescript support',
			tasksCompleted: 25,
			totalTasks: 57,
			$$slots: {
				comments: ($$renderer) => {
					$$renderer.push(`<div slot="comments">`);

					Comment($$renderer, {
						name: 'Ecma Script',
						postedAt: new Date('2020-08-17T14:12:23'),
						children: ($$renderer) => {
							$$renderer.push(`<p>Those interface tests are now passing.</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----></li> <li class="svelte-mv9go9">`);

		Project($$renderer, {
			title: 'Update documentation',
			tasksCompleted: 18,
			totalTasks: 21
		});

		$$renderer.push(`<!----></li></ul>`);
	});
}