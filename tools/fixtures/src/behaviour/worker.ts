import { Worker } from 'node:worker_threads';

/**
 * Requests to a worker thread, answered in order. The worker is started on the first request and
 * kept referenced only while one is pending, so an idle worker does not keep the process alive.
 */
export function rpc<Req, Res>(url: URL, crashed: (message: string) => Res): (req: Req) => Promise<Res> {
	let worker: Worker | undefined;
	let pending: ((r: Res) => void)[] = [];
	return (req) => {
		if (!worker) {
			const w = new Worker(url);
			w.on('message', (r: Res) => {
				pending.shift()!(r);
				if (pending.length === 0) w.unref();
			});
			w.on('error', (e: Error) => {
				for (const resolve of pending) resolve(crashed(e.message));
				pending = [];
				worker = undefined;
			});
			worker = w;
		}
		worker.ref();
		return new Promise((resolve) => {
			pending.push(resolve);
			worker!.postMessage(req);
		});
	};
}
