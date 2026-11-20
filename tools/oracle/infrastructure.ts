// What a failure of the machine looks like in an oracle's refusal, by the text Node writes for it.
// Such a refusal says nothing about the unit, so regen must not record it as expected output.
const MACHINE_FAILURES: readonly { cause: string; shape: RegExp }[] = [
	// A system error, `CODE: description, syscall [path]`, thrown here or printed by a crashed child.
	{ cause: 'a system call failed', shape: /^(?:Error: )?E[A-Z0-9]+: [^\n]*, [a-z_]+(?: |$)/m },
	// A child that could not start or whose output overflowed its buffer.
	{ cause: 'a child process could not run', shape: /^spawnSync \S+ E[A-Z0-9]+$/m },
	{ cause: 'a child process ran out of memory', shape: /^<--- Last few GCs --->$/m },
];

/** Why `text`, an oracle's refusal, is a failure of the machine that ran it, if it is one. */
export const machineFailure = (text: string): string | undefined =>
	MACHINE_FAILURES.find(({ shape }) => shape.test(text))?.cause;
