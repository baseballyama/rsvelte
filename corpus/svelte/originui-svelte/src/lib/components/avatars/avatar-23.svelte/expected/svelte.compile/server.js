import * as $ from 'svelte/internal/server';
import AvatarImg01 from '$assets/avatar-80-03.jpg?w=80&h=80&enhanced';
import AvatarImg02 from '$assets/avatar-80-05.jpg?w=80&h=80&enhanced';
import AvatarImg03 from '$assets/avatar-80-06.jpg?w=80&h=80&enhanced';
import AvatarImg04 from '$assets/avatar-80-07.jpg?w=80&h=80&enhanced';

export default function Avatar_23($$renderer) {
	$$renderer.push(`<div class="border-border bg-background flex items-center rounded-full border p-1 shadow-sm shadow-black/5"><div class="flex -space-x-1.5"><enhanced:img class="ring-background size-5 rounded-full ring-1"${$.attr('src', AvatarImg01)} alt="Avatar 01" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1"${$.attr('src', AvatarImg02)} alt="Avatar 02" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1"${$.attr('src', AvatarImg03)} alt="Avatar 03" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1"${$.attr('src', AvatarImg04)} alt="Avatar 04" loading="lazy" decoding="async"></enhanced:img></div> <p class="text-muted-foreground px-2 text-xs">Trusted by <strong class="text-foreground font-medium">60K+</strong> developers.</p></div>`);
}