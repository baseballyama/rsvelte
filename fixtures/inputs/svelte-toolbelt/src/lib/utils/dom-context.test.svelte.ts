import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DOMContext } from "./dom-context.svelte.js";
import { box } from "$lib/box/box.svelte.js";

describe("DOMContext", () => {
	let container: HTMLElement;
	let shadowHost: HTMLElement;
	let shadowRoot: ShadowRoot;

	beforeEach(() => {
		// Clean up DOM
		document.body.innerHTML = "";

		// Create test container
		container = document.createElement("div");
		container.id = "test-container";
		document.body.appendChild(container);

		// Create shadow DOM setup
		shadowHost = document.createElement("div");
		shadowHost.id = "shadow-host";
		shadowRoot = shadowHost.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = `
			<div id="shadow-content">
				<button id="shadow-button">Shadow Button</button>
				<input id="shadow-input" />
			</div>
		`;
		container.appendChild(shadowHost);
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	describe("constructor", () => {
		it("should accept a Box<HTMLElement | null>", () => {
			const element = document.createElement("div");
			const elementBox = box(element);
			const context = new DOMContext(elementBox);

			expect(context.element.current).toBe(element);
		});

		it("should accept an ElementGetter function", () => {
			const element = document.createElement("div");
			const getter = () => element;
			const context = new DOMContext(getter);

			expect(context.element.current).toBe(element);
		});

		it("should handle null element", () => {
			const context = new DOMContext(box(null));
			expect(context.element.current).toBe(null);
		});

		it("should handle getter returning null", () => {
			const getter = () => null;
			const context = new DOMContext(getter);
			expect(context.element.current).toBe(null);
		});
	});

	describe("root", () => {
		it("should return document when element is null", () => {
			const context = new DOMContext(box(null));
			expect(context.root).toBe(document);
		});

		it("should return document for regular DOM elements", () => {
			const element = document.createElement("div");
			document.body.appendChild(element);
			const context = new DOMContext(box(element));

			expect(context.root).toBe(document);
		});

		it("should return shadow root for shadow DOM elements", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			expect(context.root).toBe(shadowRoot);
		});

		it("should handle nested shadow DOM", () => {
			// Create nested shadow DOM
			const nestedHost = document.createElement("div");
			const nestedShadow = nestedHost.attachShadow({ mode: "open" });
			nestedShadow.innerHTML = '<span id="nested-span">Nested</span>';
			shadowRoot.appendChild(nestedHost);

			const nestedSpan = nestedShadow.getElementById("nested-span")!;
			const context = new DOMContext(box(nestedSpan));

			expect(context.root).toBe(nestedShadow);
		});
	});

	describe("getDocument", () => {
		it("should return document for regular DOM context", () => {
			const element = document.createElement("div");
			const context = new DOMContext(box(element));

			expect(context.getDocument()).toBe(document);
		});

		it("should return document for shadow DOM context", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			expect(context.getDocument()).toBe(document);
		});

		it("should return document when element is null", () => {
			const context = new DOMContext(box(null));
			expect(context.getDocument()).toBe(document);
		});
	});

	describe("getWindow", () => {
		it("should return window for regular DOM context", () => {
			const element = document.createElement("div");
			const context = new DOMContext(box(element));

			expect(context.getWindow()).toBe(window);
		});

		it("should return window for shadow DOM context", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			expect(context.getWindow()).toBe(window);
		});

		it("should return window when element is null", () => {
			const context = new DOMContext(box(null));
			expect(context.getWindow()).toBe(window);
		});
	});

	describe("getActiveElement", () => {
		it("should return active element from document context", () => {
			const button = document.createElement("button");
			container.appendChild(button);
			button.focus();

			const context = new DOMContext(box(container));
			expect(context.getActiveElement()).toBe(button);
		});

		it("should return active element from shadow DOM context", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button") as HTMLButtonElement;
			shadowButton.focus();

			const context = new DOMContext(box(shadowHost));
			expect(context.getActiveElement()).toBe(shadowButton);
		});

		it("should handle null element context", () => {
			const context = new DOMContext(box(null));
			// Should return whatever is currently active in document
			expect(context.getActiveElement()).toBeDefined();
		});
	});

	describe("isActiveElement", () => {
		it("should return true for active element", () => {
			const button = document.createElement("button");
			container.appendChild(button);
			button.focus();

			const context = new DOMContext(box(container));
			expect(context.isActiveElement(button)).toBe(true);
		});

		it("should return false for non-active element", () => {
			const button1 = document.createElement("button");
			const button2 = document.createElement("button");
			container.appendChild(button1);
			container.appendChild(button2);
			button1.focus();

			const context = new DOMContext(box(container));
			expect(context.isActiveElement(button2)).toBe(false);
		});

		it("should return false for null element", () => {
			const context = new DOMContext(box(container));
			expect(context.isActiveElement(null)).toBe(false);
		});

		it("should work with shadow DOM elements", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button") as HTMLButtonElement;
			shadowButton.focus();

			const shadowContext = new DOMContext(box(shadowButton));
			expect(shadowContext.isActiveElement(shadowButton)).toBe(true);
		});
	});

	describe("getElementById", () => {
		it("should find element by ID in document context", () => {
			const testDiv = document.createElement("div");
			testDiv.id = "test-div";
			container.appendChild(testDiv);

			const context = new DOMContext(box(container));
			expect(context.getElementById("test-div")).toBe(testDiv);
		});

		it("should find element by ID in shadow DOM context", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			expect(context.getElementById("shadow-button")).toBe(shadowButton);
		});

		it("should return null for non-existent ID", () => {
			const context = new DOMContext(box(container));
			expect(context.getElementById("non-existent")).toBe(null);
		});

		it("should not find shadow DOM elements from document context", () => {
			const context = new DOMContext(box(container));
			expect(context.getElementById("shadow-button")).toBe(null);
		});

		it("should support generic typing", () => {
			const input = document.createElement("input");
			input.id = "test-input";
			container.appendChild(input);

			const context = new DOMContext(box(container));
			const foundInput = context.getElementById<HTMLInputElement>("test-input");
			expect(foundInput).toBe(input);
			// TypeScript should infer this as HTMLInputElement | null
		});
	});

	describe("querySelector", () => {
		it("should find element by selector in document context", () => {
			const testDiv = document.createElement("div");
			testDiv.className = "test-class";
			container.appendChild(testDiv);

			const context = new DOMContext(box(container));
			expect(context.querySelector(".test-class")).toBe(testDiv);
		});

		it("should find element by selector in shadow DOM context", () => {
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			expect(context.querySelector("button")).toBe(shadowButton);
		});

		it("should return null for non-existent selector", () => {
			const context = new DOMContext(box(container));
			expect(context.querySelector(".non-existent")).toBe(null);
		});

		it("should return null when root is null", () => {
			const context = new DOMContext(box(null));
			// Mock the root to be null for this test
			Object.defineProperty(context, "root", { value: null });
			expect(context.querySelector("div")).toBe(null);
		});

		it("should not find shadow DOM elements from document context", () => {
			const context = new DOMContext(box(container));
			expect(context.querySelector("#shadow-button")).toBe(null);
		});
	});

	describe("querySelectorAll", () => {
		it("should find all elements by selector in document context", () => {
			const div1 = document.createElement("div");
			const div2 = document.createElement("div");
			div1.className = "test-class";
			div2.className = "test-class";
			container.appendChild(div1);
			container.appendChild(div2);

			const context = new DOMContext(box(container));
			const elements = context.querySelectorAll(".test-class");
			expect(elements.length).toBe(2);
			expect(elements[0]).toBe(div1);
			expect(elements[1]).toBe(div2);
		});

		it("should find all elements by selector in shadow DOM context", () => {
			// Add another button to shadow DOM
			const extraButton = document.createElement("button");
			extraButton.textContent = "Extra Button";
			shadowRoot.appendChild(extraButton);

			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			const context = new DOMContext(box(shadowButton));

			const buttons = context.querySelectorAll("button");
			expect(buttons.length).toBe(2);
		});

		it("should return empty NodeList for non-existent selector", () => {
			const context = new DOMContext(box(container));
			const elements = context.querySelectorAll(".non-existent");
			expect(elements.length).toBe(0);
		});

		it("should return empty array when root is null", () => {
			const context = new DOMContext(box(null));
			// Mock the root to be null for this test
			Object.defineProperty(context, "root", { value: null });
			const elements = context.querySelectorAll("div");
			expect(Array.isArray(elements)).toBe(true);
			expect(elements.length).toBe(0);
		});

		it("should not find shadow DOM elements from document context", () => {
			const context = new DOMContext(box(container));
			const buttons = context.querySelectorAll("#shadow-button");
			expect(buttons.length).toBe(0);
		});
	});

	describe("reactive updates", () => {
		it("should update root when element changes", () => {
			const elementBox = box<HTMLElement | null>(container);
			const context = new DOMContext(elementBox);

			// Initially should use document root
			expect(context.root).toBe(document);

			// Change to shadow DOM element
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			elementBox.current = shadowButton;

			// Should now use shadow root
			expect(context.root).toBe(shadowRoot);
		});

		it("should handle element changing from non-null to null", () => {
			const elementBox = box<HTMLElement | null>(container);
			const context = new DOMContext(elementBox);

			expect(context.root).toBe(document);

			// Change to null
			elementBox.current = null;

			// Should fall back to document
			expect(context.root).toBe(document);
		});

		it("should update queries when element context changes", () => {
			const elementBox = box<HTMLElement | null>(container);
			const context = new DOMContext(elementBox);

			// Initially can't find shadow button
			expect(context.getElementById("shadow-button")).toBe(null);

			// Change to shadow DOM context
			const shadowButton = shadowRoot.getElementById("shadow-button")!;
			elementBox.current = shadowButton;

			// Now should find shadow button
			expect(context.getElementById("shadow-button")).toBe(shadowButton);
		});
	});
});
