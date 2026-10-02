import * as $ from 'svelte/internal/server';
import { APIKey, Device, PreAuthKey, User } from '$lib/common/classes';
import { deviceStore, userStore, apiTestStore } from '$lib/common/stores.js';
import { sortDevices, sortUsers } from '$lib/common/sorting.svelte';
import { filterDevices, filterUsers } from './searching.svelte';

export async function getUsers() {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for getting users
	let endpointURL = '/api/v1/user';

	//returning variables
	let headscaleUsers = [new User()];

	let headscaleUsersResponse = new Response();

	await fetch(headscaleURL + endpointURL, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			// return the api data
			headscaleUsersResponse = response;
		} else {
			return response.text().then((text) => {
				apiTestStore.set('failed');

				throw text;
			});
		}
	}).catch((error) => {
		apiTestStore.set('failed');

		throw error;
	});

	await headscaleUsersResponse.json().then((data) => {
		headscaleUsers = data.users;

		// sort the users
		headscaleUsers = sortUsers(headscaleUsers);
	});

	// Set the store
	apiTestStore.set('succeeded');

	userStore.set(headscaleUsers);

	// Filter the store
	filterUsers();
}

export async function editUser(currentUserId, newUsername) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/user/' + currentUserId + '/rename/' + newUsername;

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function newAPIKey(APIKeyExpiration) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/apikey';

	let APIKeyResponse = new Response();
	let APIKeyString = '';

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ expiration: APIKeyExpiration })
	}).then((response) => {
		if (response.ok) {
			APIKeyResponse = response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});

	await APIKeyResponse.json().then((data) => {
		APIKeyString = data.apiKey;
	});

	return APIKeyString;
}

export async function expireAPIKey(APIKeyPrefix) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/apikey/expire';

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ prefix: APIKeyPrefix })
	}).then((response) => {
		if (response.ok) {} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function updateTags(deviceID, tags) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = `/api/v1/node/${deviceID}/tags`;

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ tags })
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function removeUser(currentUserId) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/user/' + currentUserId;

	await fetch(headscaleURL + endpointURL, {
		method: 'DELETE',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function newUser(newUsername) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/user';

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ name: newUsername.toLowerCase() })
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function getDevices() {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for getting devices
	let endpointURL = `/api/v1/node`;

	//returning variables
	let headscaleDevices = [new Device()];

	let headscaleDeviceResponse = new Response();

	// attempt to get the user data
	await fetch(headscaleURL + endpointURL, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			// return the api data
			headscaleDeviceResponse = response;
		} else {
			return response.text().then((text) => {
				apiTestStore.set('failed');

				throw text;
			});
		}
	}).catch((error) => {
		apiTestStore.set('failed');

		throw error;
	});

	await headscaleDeviceResponse.json().then((data) => {
		headscaleDevices = data[`nodes`];
		headscaleDevices = sortDevices(headscaleDevices);
	});

	// set the stores
	apiTestStore.set('succeeded');

	deviceStore.set(headscaleDevices);

	// filter the store
	filterDevices();
}

export async function getAPIKeys() {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/apikey';

	let apiKeysResponse = new Response();
	let apiKeys = [new APIKey()];

	await fetch(headscaleURL + endpointURL, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			apiKeysResponse = response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});

	await apiKeysResponse.json().then((data) => {
		apiKeys = data.apiKeys;
	});

	return apiKeys;
}

export async function getPreauthKeys(userID) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/preauthkey';

	//returning variables
	let headscalePreAuthKey = [new PreAuthKey()];

	let headscalePreAuthKeyResponse = new Response();

	await fetch(headscaleURL + endpointURL + '?user=' + userID, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			headscalePreAuthKeyResponse = response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});

	await headscalePreAuthKeyResponse.json().then((data) => {
		headscalePreAuthKey = data.preAuthKeys;
	});

	return headscalePreAuthKey;
}

export async function newPreAuthKey(userID, expiry, reusable, ephemeral) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = '/api/v1/preauthkey';

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ user: userID, expiration: expiry, reusable, ephemeral })
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function removePreAuthKey(userID, preAuthKey) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for removing devices
	let endpointURL = '/api/v1/preauthkey/expire';

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ user: userID, key: preAuthKey })
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function newDevice(key, userId) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = `/api/v1/node/register`;

	await fetch(headscaleURL + endpointURL + '?user=' + userId + '&key=' + key, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function moveDevice(deviceID, userID) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = `/api/v1/node/${deviceID}/user`;

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ user: parseInt(userID) })
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function renameDevice(deviceID, name) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for editing users
	let endpointURL = `/api/v1/node/${deviceID}/rename/${name}`;

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export async function removeDevice(deviceID) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';

	// endpoint url for removing devices
	let endpointURL = `/api/v1/node/${deviceID}`;

	await fetch(headscaleURL + endpointURL, {
		method: 'DELETE',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		}
	}).then((response) => {
		if (response.ok) {
			return response;
		} else {
			return response.text().then((text) => {
				throw JSON.parse(text).message;
			});
		}
	}).catch((error) => {
		throw error;
	});
}

export default function ApiFunctions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}