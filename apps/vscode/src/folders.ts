// Which workspace folders get a server of their own.
import path from 'node:path';

/** The items whose directory is inside no other item's, so a file is never served twice. */
export function outermost<T>(items: T[], directory: (item: T) => string): T[] {
	return items.filter(
		(item) => !items.some((outer) => outer !== item && inside(directory(item), directory(outer))),
	);
}

/** Whether `inner` is a directory below `outer`. */
function inside(inner: string, outer: string): boolean {
	const relative = path.relative(outer, inner);
	return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}
