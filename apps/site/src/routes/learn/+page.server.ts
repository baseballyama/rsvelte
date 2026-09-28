import { crateSizes } from '$lib/server/source';

export const load = () => {
	const kernel = crateSizes().find((c) => c.name === 'rsv_kernel');
	if (!kernel) throw new Error('no rsv_kernel crate');
	return { kernelLines: kernel.lines, kernelFiles: kernel.files };
};
