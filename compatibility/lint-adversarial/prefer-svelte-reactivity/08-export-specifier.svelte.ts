const sessions = new Set<string>();
let lastSeen = new Date();

export { sessions, lastSeen as seen };

export const urls: URL[] = [];
