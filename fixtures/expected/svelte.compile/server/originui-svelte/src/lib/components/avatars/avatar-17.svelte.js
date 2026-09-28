import * as $ from 'svelte/internal/server';
import AvatarImg01 from '$assets/avatar-80-03.jpg?w=96&h=96&enhanced';
import AvatarImg02 from '$assets/avatar-80-05.jpg?w=96&h=96&enhanced';
import AvatarImg03 from '$assets/avatar-80-06.jpg?w=96&h=96&enhanced';
import AvatarImg04 from '$assets/avatar-80-07.jpg?w=96&h=96&enhanced';

export default function Avatar_17($$renderer) {
	$$renderer.push(`<div class="flex -space-x-[0.9rem]"><enhanced:img class="ring-background size-12 rounded-full ring-2"${$.attr('src', AvatarImg01)} alt="Avatar 01" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-12 rounded-full ring-2"${$.attr('src', AvatarImg02)} alt="Avatar 02" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-12 rounded-full ring-2"${$.attr('src', AvatarImg03)} alt="Avatar 03" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-12 rounded-full ring-2"${$.attr('src', AvatarImg04)} alt="Avatar 04" loading="lazy" decoding="async"></enhanced:img></div>`);
}