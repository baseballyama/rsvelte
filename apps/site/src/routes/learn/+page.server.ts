import { crateSizes } from '$lib/server/source';

export const load = () => {
	const kernel = crateSizes().find((c) => c.name === 'rsvelte_kernel');
	if (!kernel) throw new Error('no rsvelte_kernel crate');
	return { kernelLines: kernel.lines, kernelFiles: kernel.files };
};
