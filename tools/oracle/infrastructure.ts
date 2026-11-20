// Node's system errors read `CODE: description, syscall [path]`. One of them means the machine failed
// (a full disk, too many open files), not that the oracle refused the unit.
const SYSTEM_ERROR = /^E[A-Z0-9]+: [^\n]*, [a-z_]+(?: |$)/m;

/** Whether `text`, an oracle's refusal, is the failure of the machine that ran it. */
export const isInfrastructureError = (text: string): boolean => SYSTEM_ERROR.test(text);
