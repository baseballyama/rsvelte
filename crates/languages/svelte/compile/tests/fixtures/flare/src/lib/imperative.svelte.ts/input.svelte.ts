type ImperativeCommand = {
	nodeId: number;
	command: 'focus' | 'reset';
	timestamp: number;
};

let command = $state<ImperativeCommand | null>(null);

export const imperativeBus = {
	get command() {
		return command;
	},
	dispatch: (nodeId: number, cmd: 'focus' | 'reset') => {
		command = { nodeId, command: cmd, timestamp: Date.now() };
	}
};
