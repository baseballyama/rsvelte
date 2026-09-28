import * as $ from 'svelte/internal/server';

export function sortUsers(users) {
	let sortKey = localStorage.getItem('headscaleUserSort') || '';
	let sortDirection = localStorage.getItem('headscaleUserSortDirection') || '';
	let sortedUsers = users;
	let collator = new Intl.Collator([], { numeric: true });

	if (sortDirection == 'ascending') {
		switch (sortKey) {
			case 'id':
				sortedUsers = users.sort((a, b) => collator.compare(a.id, b.id));
				break;

			case 'createdAt':
				sortedUsers = users.sort((a, b) => -collator.compare(a.createdAt, b.createdAt));
				break;

			case 'name':
				sortedUsers = users.sort((a, b) => collator.compare(a.name, b.name));
				break;
		}
	}

	if (sortDirection == 'descending') {
		switch (sortKey) {
			case 'id':
				sortedUsers = users.sort((a, b) => -collator.compare(a.id, b.id));
				break;

			case 'createdAt':
				sortedUsers = users.sort((a, b) => collator.compare(a.createdAt, b.createdAt));
				break;

			case 'name':
				sortedUsers = users.sort((a, b) => -collator.compare(a.name, b.name));
				break;
		}
	}

	return sortedUsers;
}

export function sortDevices(devices) {
	let sortKey = localStorage.getItem('headscaleDeviceSort') || '';
	let sortDirection = localStorage.getItem('headscaleDeviceSortDirection') || '';
	let sortedDevices = devices;
	let collator = new Intl.Collator([], { numeric: true });

	if (sortDirection == 'ascending') {
		switch (sortKey) {
			case 'id':
				sortedDevices = devices.sort((a, b) => collator.compare(a.id, b.id));
				break;

			case 'lastSeen':
				sortedDevices = devices.sort((a, b) => -collator.compare(a.lastSeen, b.lastSeen));
				break;

			case 'givenName':
				sortedDevices = devices.sort((a, b) => collator.compare(a.givenName, b.givenName));
				break;
		}
	}

	if (sortDirection == 'descending') {
		switch (sortKey) {
			case 'id':
				sortedDevices = devices.sort((a, b) => -collator.compare(a.id, b.id));
				break;

			case 'lastSeen':
				sortedDevices = devices.sort((a, b) => collator.compare(a.lastSeen, b.lastSeen));
				break;

			case 'givenName':
				sortedDevices = devices.sort((a, b) => -collator.compare(a.givenName, b.givenName));
				break;
		}
	}

	return sortedDevices;
}

export default function Sorting($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}