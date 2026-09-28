import { boxWith } from "$lib/box/box-extras.svelte.js";
import type { Box } from "$lib/types.js";
import { getActiveElement, getDocument } from "./dom.js";

type ElementGetter = () => HTMLElement | null;

export class DOMContext {
	readonly element: Box<HTMLElement | null>;
	readonly root: Document | ShadowRoot = $derived.by(() => {
		if (!this.element.current) return document;
		const rootNode = this.element.current.getRootNode() ?? document;
		return rootNode as Document | ShadowRoot;
	});

	constructor(element: Box<HTMLElement | null> | ElementGetter) {
		if (typeof element === "function") {
			this.element = boxWith(element);
		} else {
			this.element = element;
		}
	}

	getDocument = () => {
		return getDocument(this.root);
	};

	getWindow = () => {
		return this.getDocument().defaultView ?? window;
	};

	getActiveElement = () => {
		return getActiveElement(this.root);
	};

	isActiveElement = (node: HTMLElement | null) => {
		return node === this.getActiveElement();
	};

	getElementById<T extends Element = HTMLElement>(id: string) {
		return this.root.getElementById(id) as T | null;
	}

	querySelector = (selector: string) => {
		if (!this.root) return null;
		return this.root.querySelector(selector);
	};

	querySelectorAll = (selector: string) => {
		if (!this.root) return [] as unknown as NodeListOf<Element>;
		return this.root.querySelectorAll(selector);
	};

	setTimeout = (callback: () => void, delay: number) => {
		return this.getWindow().setTimeout(callback, delay);
	};

	clearTimeout = (timeoutId: number) => {
		return this.getWindow().clearTimeout(timeoutId);
	};
}
