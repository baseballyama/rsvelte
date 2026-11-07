import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PageHeader from '$lib/components/layout/page-header.svelte';
import { EllipsisVerticalIcon, PlusIcon } from '@lucide/svelte';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<button type="button" class="btn lg:btn-lg preset-filled"><!> <span>Invite</span></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<tr><td><!></td><td class="font-bold"> </td><td> </td><td> </td><td class="text-right"><button type="button" class="btn-icon hover:preset-tonal" aria-label="Member actions"><!></button></td></tr>`);
var root_3 = $.from_html(`<div><!> <div class="container-page"><div class="table-wrap"><table class="table caption-bottom"><thead><tr><th></th><th>First Name</th><th>Last Name</th><th>Email</th><th class="text-right!"></th></tr></thead><tbody></tbody></table></div></div></div>`);

export default function _page($$anchor) {
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

	var div = root_3();
	var node = $.child(div);

	{
		const trail = ($$anchor) => {
			var button = root();
			var node_1 = $.child(button);

			PlusIcon(node_1, {});
			$.next(2);
			$.reset(button);
			$.append($$anchor, button);
		};

		PageHeader(node, { title: 'Team', trail, $$slots: { trail: true } });
	}

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var table = $.child(div_2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => teamMembers, ({ firstName, lastName, email, image }) => email, ($$anchor, $$item) => {
		let firstName = () => $.get($$item).firstName;
		let lastName = () => $.get($$item).lastName;
		let email = () => $.get($$item).email;
		let image = () => $.get($$item).image;
		var tr = root_2();
		var td = $.child(tr);
		var node_2 = $.child(td);

		Avatar(node_2, {
			class: 'size-10',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_3 = $.first_child(fragment);

				$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
					Avatar_Image($$anchor, {
						get src() {
							return image();
						},

						get alt() {
							return `${firstName() ?? ''} ${lastName() ?? ''}`;
						}
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
					Avatar_Fallback($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${firstName()[0] ?? ''}${lastName()[0] ?? ''}`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_2 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var button_1 = $.child(td_4);
		var node_5 = $.child(button_1);

		EllipsisVerticalIcon(node_5, {});
		$.reset(button_1);
		$.reset(td_4);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_1, firstName());
			$.set_text(text_2, lastName());
			$.set_text(text_3, email());
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}