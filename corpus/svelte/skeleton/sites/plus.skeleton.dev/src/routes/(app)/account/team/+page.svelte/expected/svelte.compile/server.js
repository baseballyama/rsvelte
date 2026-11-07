import * as $ from 'svelte/internal/server';
import PageHeader from '$lib/components/layout/page-header.svelte';
import { EllipsisVerticalIcon, PlusIcon } from '@lucide/svelte';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	const teamMembers = [
		{
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@skeleton.dev',
			image: 'https://i.pravatar.cc/150?img=1'
		},

		{
			firstName: 'Alan',
			lastName: 'Turing',
			email: 'alan@skeleton.dev',
			image: 'https://i.pravatar.cc/150?img=12'
		},

		{
			firstName: 'Grace',
			lastName: 'Hopper',
			email: 'grace@skeleton.dev',
			image: 'https://i.pravatar.cc/150?img=5'
		},

		{
			firstName: 'Linus',
			lastName: 'Torvalds',
			email: 'linus@skeleton.dev',
			image: 'https://i.pravatar.cc/150?img=15'
		},

		{
			firstName: 'Margaret',
			lastName: 'Hamilton',
			email: 'margaret@skeleton.dev',
			image: 'https://i.pravatar.cc/150?img=9'
		}
	];

	$$renderer.push(`<div>`);

	{
		function trail($$renderer) {
			$$renderer.push(`<button type="button" class="btn lg:btn-lg preset-filled">`);
			PlusIcon($$renderer, {});
			$$renderer.push(`<!----> <span>Invite</span></button>`);
		}

		PageHeader($$renderer, { title: 'Team', trail, $$slots: { trail: true } });
	}

	$$renderer.push(`<!----> <div class="container-page"><div class="table-wrap"><table class="table caption-bottom"><thead><tr><th></th><th>First Name</th><th>Last Name</th><th>Email</th><th class="text-right!"></th></tr></thead><tbody><!--[-->`);

	const each_array = $.ensure_array_like(teamMembers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { firstName, lastName, email, image } = each_array[$$index];

		$$renderer.push(`<tr><td>`);

		Avatar($$renderer, {
			class: 'size-10',
			children: ($$renderer) => {
				if (Avatar.Image) {
					$$renderer.push('<!--[-->');

					Avatar.Image($$renderer, {
						src: image,
						alt: `${$.stringify(firstName)} ${$.stringify(lastName)}`
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(firstName[0])}${$.escape(lastName[0])}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></td><td class="font-bold">${$.escape(firstName)}</td><td>${$.escape(lastName)}</td><td>${$.escape(email)}</td><td class="text-right"><button type="button" class="btn-icon hover:preset-tonal" aria-label="Member actions">`);
		EllipsisVerticalIcon($$renderer, {});
		$$renderer.push(`<!----></button></td></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table></div></div></div>`);
}