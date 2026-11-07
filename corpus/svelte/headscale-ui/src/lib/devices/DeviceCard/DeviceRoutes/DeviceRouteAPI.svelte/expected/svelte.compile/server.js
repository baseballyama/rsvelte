import * as $ from 'svelte/internal/server';

export async function approveDeviceRoute(deviceID, routes) {
	// variables in local storage
	let headscaleURL = localStorage.getItem('headscaleURL') || '';

	let headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';
	let endpointURL = `/api/v1/node/${deviceID}/approve_routes`;

	await fetch(headscaleURL + endpointURL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${headscaleAPIKey}`
		},
		body: JSON.stringify({ routes })
	}).then((response) => {
		if (response.ok) {
			// return the api data
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

export default function DeviceRouteAPI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}