import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import AvatarImg01 from '$assets/avatar-80-03.jpg?w=80&h=80&enhanced';
import AvatarImg02 from '$assets/avatar-80-05.jpg?w=80&h=80&enhanced';
import AvatarImg03 from '$assets/avatar-80-06.jpg?w=80&h=80&enhanced';
import AvatarImg04 from '$assets/avatar-80-07.jpg?w=80&h=80&enhanced';

export default function Avatar_21($$renderer) {
	$$renderer.push(`<div class="bg-muted flex items-center rounded-full p-0.5"><div class="flex -space-x-3"><enhanced:img class="ring-muted size-10 rounded-full ring-2"${$.attr('src', AvatarImg01)} alt="Avatar 01" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-muted size-10 rounded-full ring-2"${$.attr('src', AvatarImg02)} alt="Avatar 02" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-muted size-10 rounded-full ring-2"${$.attr('src', AvatarImg03)} alt="Avatar 03" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-muted size-10 rounded-full ring-2"${$.attr('src', AvatarImg04)} alt="Avatar 04" loading="lazy" decoding="async"></enhanced:img></div> `);

	Button($$renderer, {
		variant: 'secondary',
		class: 'text-muted-foreground hover:text-foreground flex items-center justify-center rounded-full bg-transparent px-3 text-xs shadow-none hover:bg-transparent',
		children: ($$renderer) => {
			$$renderer.push(`<!---->+3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}