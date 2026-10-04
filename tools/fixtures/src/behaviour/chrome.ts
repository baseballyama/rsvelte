import { spawn } from 'node:child_process';

const START_TIMEOUT_MS = 15_000;
const COMMAND_TIMEOUT_MS = 30_000;
const SHUTDOWN_TIMEOUT_MS = 2_000;
const MAX_START_LOG_BYTES = 32 * 1024;
const debug = (message: string) => {
	if (process.env.RSVELTE_BROWSER_DEBUG) console.error(message);
};

interface Reply {
	id?: number;
	method?: string;
	sessionId?: string;
	result?: unknown;
	params?: unknown;
	error?: { message: string };
}

export async function chrome(binary: string, profile: string) {
	const child = spawn(
		binary,
		[
			'--headless',
			'--disable-gpu',
			'--no-first-run',
			'--no-default-browser-check',
			'--disable-background-timer-throttling',
			'--disable-renderer-backgrounding',
			'--remote-debugging-port=0',
			`--user-data-dir=${profile}`,
		],
		{ detached: true, stdio: ['ignore', 'ignore', 'pipe'] },
	);
	const exited = new Promise<void>((resolve) =>
		child.once('close', () => resolve()),
	);
	let socket: WebSocket | undefined;
	const signal = (signal: NodeJS.Signals) => {
		if (child.pid === undefined) return;
		try {
			process.kill(-child.pid, signal);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
		}
	};
	const stop = async () => {
		socket?.close();
		signal('SIGTERM');
		const timeout = setTimeout(() => signal('SIGKILL'), SHUTDOWN_TIMEOUT_MS);
		await exited;
		clearTimeout(timeout);
	};
	try {
		const endpoint = await new Promise<string>((resolve, reject) => {
			let log = '';
			const timeout = setTimeout(
				() => reject(new Error(`Chrome did not start: ${log}`)),
				START_TIMEOUT_MS,
			);
			const data = (chunk: Buffer) => {
				log = (log + chunk.toString()).slice(-MAX_START_LOG_BYTES);
				const match = /DevTools listening on (ws:\/\/\S+)/.exec(log);
				if (match) {
					clearTimeout(timeout);
					child.stderr.off('data', data);
					child.stderr.resume();
					resolve(match[1]!);
				}
			};
			child.stderr.on('data', data);
			child.once('error', (error) => {
				clearTimeout(timeout);
				reject(error);
			});
			child.once('exit', (code) => {
				clearTimeout(timeout);
				reject(new Error(`Chrome exited (${code}): ${log}`));
			});
		});
		debug('Chrome started');
		socket = new WebSocket(endpoint);
		const connection = socket;
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(
				() => reject(new Error('Chrome connection timed out')),
				START_TIMEOUT_MS,
			);
			connection.addEventListener(
				'open',
				() => {
					clearTimeout(timeout);
					resolve();
				},
				{ once: true },
			);
			connection.addEventListener(
				'error',
				() => {
					clearTimeout(timeout);
					reject(new Error('Chrome connection failed'));
				},
				{ once: true },
			);
		});
		debug('Chrome connected');
		let next = 0;
		const pending = new Map<
			number,
			{ resolve(value: unknown): void; reject(error: Error): void }
		>();
		const events = new Map<
			string,
			{ resolve(value: unknown): void; reject(error: Error): void }
		>();
		connection.addEventListener('message', (event) => {
			const reply = JSON.parse(String(event.data)) as Reply;
			if (typeof reply.id === 'number') {
				debug(`Chrome reply ${reply.id}`);
				const request = pending.get(reply.id);
				pending.delete(reply.id);
				if (reply.error) request?.reject(new Error(reply.error.message));
				else request?.resolve(reply.result);
			} else {
				const key = `${reply.sessionId}:${reply.method}`;
				const listener = events.get(key);
				events.delete(key);
				listener?.resolve(reply.params);
			}
		});
		connection.addEventListener('close', () => {
			const error = new Error('Chrome connection closed');
			pending.forEach((request) => request.reject(error));
			events.forEach((listener) => listener.reject(error));
			pending.clear();
			events.clear();
		});
		const command = async <T>(
			method: string,
			params: object,
			sessionId?: string,
		): Promise<T> => {
			if (connection.readyState !== WebSocket.OPEN)
				throw new Error('Chrome connection is not open');
			const id = ++next;
			debug(method);
			return await new Promise<T>((resolve, reject) => {
				const timeout = setTimeout(() => {
					pending.delete(id);
					reject(new Error(`Chrome command timed out: ${method}`));
				}, COMMAND_TIMEOUT_MS);
				pending.set(id, {
					resolve(value) {
						clearTimeout(timeout);
						resolve(value as T);
					},
					reject(error) {
						clearTimeout(timeout);
						reject(error);
					},
				});
				connection.send(JSON.stringify({ id, method, params, sessionId }));
			});
		};
		return {
			async trace(url: string): Promise<string> {
				const { targetId } = await command<{ targetId: string }>(
					'Target.createTarget',
					{ url: 'about:blank' },
				);
				try {
					const { sessionId } = await command<{ sessionId: string }>(
						'Target.attachToTarget',
						{ targetId, flatten: true },
					);
					await command('Page.enable', {}, sessionId);
					const key = `${sessionId}:Page.loadEventFired`;
					const loaded = new Promise<void>((resolve, reject) => {
						const timeout = setTimeout(() => {
							events.delete(key);
							reject(new Error('Chrome navigation timed out'));
						}, COMMAND_TIMEOUT_MS);
						events.set(key, {
							resolve() {
								clearTimeout(timeout);
								resolve();
							},
							reject(error) {
								clearTimeout(timeout);
								reject(error);
							},
						});
					});
					await command('Page.navigate', { url }, sessionId);
					await loaded;
					const result = await command<{
						result: { value?: string };
						exceptionDetails?: unknown;
					}>(
						'Runtime.evaluate',
						{
							expression: `new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('browser trace timeout')), 10000);
              const observer = new MutationObserver(check);
              observer.observe(document, { subtree: true, childList: true, characterData: true });
              function check() {
                const text = document.querySelector('#result')?.textContent;
                if (text) { observer.disconnect(); clearTimeout(timeout); resolve(text); }
              }
              check();
            })`,
							awaitPromise: true,
							returnByValue: true,
						},
						sessionId,
					);
					if (
						result.exceptionDetails ||
						typeof result.result.value !== 'string'
					)
						throw new Error(JSON.stringify(result));
					return result.result.value;
				} finally {
					await command('Target.closeTarget', { targetId });
				}
			},
			async close() {
				await stop();
			},
		};
	} catch (error) {
		await stop();
		throw error;
	}
}
