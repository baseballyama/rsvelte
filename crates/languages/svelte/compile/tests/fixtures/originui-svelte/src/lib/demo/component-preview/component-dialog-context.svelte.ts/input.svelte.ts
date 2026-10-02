import type { AvailableOUIComponent } from '$data/api/components/components.handler';

import { getContext, setContext } from 'svelte';

const COMPONENT_DIALOG_CTX_KEY = Symbol('ctx:component-dialog');

type ComponentDialogProps = {
	component?: AvailableOUIComponent;
};

class ComponentDialog {
	#component = $state<ComponentDialogProps['component']>();

	constructor(props: ComponentDialogProps) {
		this.#component = props.component;
	}

	get component() {
		return this.#component;
	}

	reset() {
		this.#component = undefined;
	}

	setComponent(component: AvailableOUIComponent) {
		this.#component = component;
	}
}

export const setComponentDialogCtx = (props: ComponentDialogProps) => {
	return setContext(COMPONENT_DIALOG_CTX_KEY, new ComponentDialog(props));
};

export const getComponentDialogCtx = (): ComponentDialog => {
	return getContext<ReturnType<typeof setComponentDialogCtx>>(COMPONENT_DIALOG_CTX_KEY);
};
