// Port of `rsv_kernel::json::JsonWriter`: a stack of "has a member been written" flags and an
// `afterKey` bit are the writer's entire state. `steps` exposes that state after each call.

export interface WriterState {
	call: string;
	out: string;
	stack: boolean[];
	afterKey: boolean;
}

export function writeStr(s: string): string {
	let out = '"';
	for (const c of s) {
		const u = c.codePointAt(0)!;
		if (c === '"') out += '\\"';
		else if (c === '\\') out += '\\\\';
		else if (c === '\n') out += '\\n';
		else if (c === '\r') out += '\\r';
		else if (c === '\t') out += '\\t';
		else if (u < 0x20) out += '\\u' + u.toString(16).padStart(4, '0');
		else out += c;
	}
	return out + '"';
}

export class JsonWriter {
	out = '';
	stack: boolean[] = [];
	afterKey = false;
	steps: WriterState[] = [];

	constructor(private readonly pretty: boolean) {}

	private record(call: string): this {
		this.steps.push({ call, out: this.out, stack: [...this.stack], afterKey: this.afterKey });
		return this;
	}

	finish(): string {
		if (this.pretty) this.out += '\n';
		return this.out;
	}

	private newline() {
		if (this.pretty) this.out += '\n' + '\t'.repeat(this.stack.length);
	}

	private beforeValue() {
		if (this.afterKey) {
			this.afterKey = false;
			return;
		}
		if (this.stack.length > 0) {
			const comma = this.stack[this.stack.length - 1];
			this.stack[this.stack.length - 1] = true;
			if (comma) this.out += ',';
			this.newline();
		}
	}

	beginObject() {
		this.beforeValue();
		this.out += '{';
		this.stack.push(false);
		return this.record('begin_object()');
	}
	endObject() {
		return this.close('}', 'end_object()');
	}
	beginArray() {
		this.beforeValue();
		this.out += '[';
		this.stack.push(false);
		return this.record('begin_array()');
	}
	endArray() {
		return this.close(']', 'end_array()');
	}
	private close(c: string, call: string) {
		if (this.stack.pop() === true) this.newline();
		this.out += c;
		return this.record(call);
	}
	key(k: string) {
		this.beforeValue();
		this.out += writeStr(k) + ':' + (this.pretty ? ' ' : '');
		this.afterKey = true;
		return this.record(`key(${JSON.stringify(k)})`);
	}
	str(s: string) {
		this.beforeValue();
		this.out += writeStr(s);
		return this.record(`str(${JSON.stringify(s)})`);
	}
	num(n: number | string) {
		this.beforeValue();
		this.out += String(n);
		return this.record(`num(${n})`);
	}
	bool(b: boolean) {
		this.beforeValue();
		this.out += b ? 'true' : 'false';
		return this.record(`bool(${b})`);
	}
	null() {
		this.beforeValue();
		this.out += 'null';
		return this.record('null()');
	}
}
