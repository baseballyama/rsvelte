// Run by `node --input-type=module-typescript --eval`, so only erasable TypeScript syntax is allowed.
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

const protocolVersion = 1;
const maxRequestBytes = 16 * 1024 * 1024;
const maxFunctions = 65536;
type Callable = (argument: Record<string, unknown>) => unknown;
type Encoded =
	| null
	| string
	| boolean
	| number
	| Encoded[]
	| { [key: string]: Encoded }
	| { backend: 'runtime'; handle: string };
interface Request {
	operation?: unknown;
	version?: unknown;
	path?: string;
	handle?: string;
	names: string[];
	arguments: unknown[];
}

const functions = new Map<string, Callable>();
const send = process.stdout.write.bind(process.stdout);
// Config logging must not corrupt the protocol.
process.stdout.write = process.stderr.write.bind(process.stderr) as typeof process.stdout.write;
let loaded = false;

function encode(value: unknown, active = new Set<object>()): Encoded {
	if (typeof value === 'function') {
		if (functions.size >= maxFunctions) throw new Error('Config contains too many functions');
		const handle = String(functions.size);
		functions.set(handle, value as Callable);
		return { backend: 'runtime', handle };
	}
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value !== 'object')
		throw new Error('Config contains a value that cannot be serialized');
	if (active.has(value)) throw new Error('Config contains a cycle');
	if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
		throw new Error('Config objects must be plain objects');
	}
	active.add(value);
	const result = Array.isArray(value)
		? value.map((item) => encode(item, active))
		: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item, active)]));
	active.delete(value);
	return result;
}

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
	try {
		if (Buffer.byteLength(line) > maxRequestBytes) throw new Error('Request is too large');
		const request = JSON.parse(line) as Request;
		let result: Encoded;
		if (request.operation === 'load') {
			if (loaded || request.version !== protocolVersion) throw new Error('Invalid load request');
			const module = (await import(pathToFileURL(request.path ?? '').href)) as { default: unknown };
			const exported = await module.default;
			result = encode(
				typeof exported === 'function' ? await (exported as () => unknown)() : exported,
			);
			loaded = true;
		} else if (request.operation === 'call') {
			const fn = functions.get(request.handle ?? '');
			if (
				!loaded ||
				!fn ||
				!Number.isInteger(request.version) ||
				request.version < 0 ||
				request.version > 0xffffffff
			) {
				throw new Error('Unknown function or invalid contract version');
			}
			if (request.names.length !== request.arguments.length) throw new Error('Invalid arguments');
			const returned = await fn(
				Object.fromEntries(request.names.map((name, index) => [name, request.arguments[index]])),
			);
			if (typeof returned !== 'string') throw new Error('Function must return a string');
			result = returned;
		} else throw new Error('Unknown operation');
		send(`${JSON.stringify({ version: protocolVersion, result })}\n`);
	} catch (error) {
		const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
		send(`${JSON.stringify({ version: protocolVersion, error: message })}\n`);
	}
}
