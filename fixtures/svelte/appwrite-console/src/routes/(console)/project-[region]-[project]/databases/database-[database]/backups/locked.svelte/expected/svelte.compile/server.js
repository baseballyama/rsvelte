import * as $ from 'svelte/internal/server';
import { app } from '$lib/stores/app';
import UpgradeCard from './upgradeCard.svelte';
import ContainerHeader from './containerHeader.svelte';
import LockedBackupsDarkDesktop from '$lib/images/backups/empty/backups-dark.png';
import LockedBackupsLightDesktop from '$lib/images/backups/empty/backups-light.png';
import LockedBackupsDarkMobile from '$lib/images/backups/empty/backups-mobile-dark.png';
import LockedBackupsLightMobile from '$lib/images/backups/empty/backups-mobile-light.png';
import LockedBackupsDarkTablet from '$lib/images/backups/empty/backups-tablet-dark.png';
import LockedBackupsLightTablet from '$lib/images/backups/empty/backups-tablet-light.png';

export default function Locked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { project } = $$props;

		$$renderer.push(`<div class="u-flex-vertical u-gap-32">`);
		UpgradeCard($$renderer, { project });
		$$renderer.push(`<!----> <div><div class="is-only-mobile u-flex-vertical u-gap-16 svelte-aak3ad">`);

		ContainerHeader($$renderer, {
			project,
			title: 'Policies',
			buttonText: 'Create policy',
			buttonType: 'secondary',
			buttonDisabled: true
		});

		$$renderer.push(`<!----> <img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? LockedBackupsDarkMobile : LockedBackupsLightMobile)} alt="create" aria-hidden="true" height="425"${$.attr_style('', { width: '100vw' })}/></div> <div class="is-tablet u-flex-vertical u-gap-16 u-width-full-line svelte-aak3ad">`);

		ContainerHeader($$renderer, {
			project,
			title: 'Policies',
			buttonText: 'Create policy',
			buttonType: 'secondary',
			buttonDisabled: true
		});

		$$renderer.push(`<!----> <img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? LockedBackupsDarkTablet : LockedBackupsLightTablet)} alt="create" height="425" aria-hidden="true"${$.attr_style('', { width: '100vw' })}/></div> <div class="is-desktop u-flex-vertical u-gap-16 svelte-aak3ad"><div class="desktop-locked-card-buttons u-flex u-gap-24"><div style="width: 31%">`);

		ContainerHeader($$renderer, {
			project,
			title: 'Policies',
			buttonText: 'Create policy',
			buttonType: 'secondary',
			buttonDisabled: true
		});

		$$renderer.push(`<!----></div> <div style="width: 69%; padding-inline-start: 1.5rem;">`);

		ContainerHeader($$renderer, {
			project,
			title: 'Backups',
			buttonText: 'Manual backup',
			buttonType: 'secondary',
			buttonDisabled: true
		});

		$$renderer.push(`<!----></div></div> <img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? LockedBackupsDarkDesktop : LockedBackupsLightDesktop)} alt="create" aria-hidden="true" height="580"${$.attr_style('', { width: '100vw' })}/></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}