export const width = window.innerWidth;

export function safe() {
	return document.body;
}

const guarded = typeof window === 'undefined' ? 0 : window.devicePixelRatio;
void guarded;
