export enum Level {
	Low = 1,
	High = 2,
}

export const state = $state({ level: Level.Low });

export function raise(): void {
	state.level = Level.High;
}
