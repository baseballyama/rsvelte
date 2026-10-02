import { describe, expect, expectTypeOf, test } from "vitest";
import { box } from "./box.svelte.js";
import { type ReadableBox, type WritableBox } from "./box-extras.svelte.js";
import type { MaybeBoxOrGetter } from "$lib/types.js";

describe("box", () => {
	test("box with initial value should be settable", () => {
		const count = box(0);
		expect(count.current).toBe(0);
		count.current = 1;
		expect(count.current).toBe(1);
	});
});

describe("box.from", () => {
	test("box of writable box should be settable", () => {
		const count = box.from(box(0));
		expect(count.current).toBe(0);
		count.current = 1;
		expect(count.current).toBe(1);
	});

	test("box of readable box should not be settable", () => {
		const count = box.from(box.with(() => 0));
		expect(count.current).toBe(0);
		// @ts-expect-error -- we're testing that the setter is not run
		expect(() => (count.current = 1)).toThrow();
	});

	test("can set box of box or value", () => {
		const count = 0 as number | WritableBox<number>;
		const reCount = box.from(count);
		expect(reCount.current).toBe(0);
		reCount.current = 1;
		expect(reCount.current).toBe(1);
	});
});

describe("box.with", () => {
	test("box with getter only should return value and not be settable", () => {
		const count = box.with(() => 0);
		expect(count.current).toBe(0);
		// @ts-expect-error -- we're testing that the setter is not run
		expect(() => (count.current = 1)).toThrow();
	});

	test("box with state getter should be reactive", () => {
		let value = $state(0);
		const count = box.with(() => value);
		expect(count.current).toBe(0);
		value++;
		expect(count.current).toBe(1);
	});

	test("box with getter and setter should be reactive", () => {
		let value = $state(0);
		const double = box.with(
			() => value,
			(v) => (value = v * 2)
		);
		expect(double.current).toBe(0);
		double.current = 1;
		expect(double.current).toBe(2);
		expect(value).toBe(2);
	});
});

describe("box.isBox", () => {
	test("box should be a box", () => {
		const count = box(0);
		expect(box.isBox(count)).toBe(true);
	});
});

describe("box.isWritableBox", () => {
	test("writable box should be a writable box", () => {
		const count = box(0);
		expect(box.isWritableBox(count)).toBe(true);
	});

	test("readable box should not be a writable box", () => {
		const count = box.from(() => 0);
		expect(box.isWritableBox(count)).toBe(false);
	});
});

describe("box.flatten", () => {
	test("flattens an object of boxes", () => {
		const count = box(0);
		const double = box.with(() => count.current * 2);
		function increment() {
			count.current++;
		}
		const flat = box.flatten({ count, double, increment });

		expect(flat.count).toBe(0);
		expect(flat.double).toBe(0);

		count.current = 1;
		expect(flat.count).toBe(1);
		expect(flat.double).toBe(2);

		flat.count = 2;
		expect(count.current).toBe(2);
		expect(flat.count).toBe(2);
		expect(double.current).toBe(4);
		expect(flat.double).toBe(4);

		// @ts-expect-error -- we're testing that the setter is not run
		expect(() => (flat.double = 3)).toThrow();

		flat.increment();
		expect(count.current).toBe(3);
		expect(double.current).toBe(6);
		expect(flat.count).toBe(3);
		expect(flat.double).toBe(6);
	});
});

describe("box.readonly", () => {
	test("box.readonly returns a non-settable box", () => {
		const count = box(0);
		const readonlyCount = box.readonly(count);

		function setReadOnlyCount() {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(readonlyCount as any).current = 1;
		}

		expect(setReadOnlyCount).toThrow();
	});

	test("box.readonly returned box should update with original box", () => {
		const count = box(0);
		const readonlyCount = box.readonly(count);

		expect(readonlyCount.current).toBe(0);
		count.current = 1;
		expect(readonlyCount.current).toBe(1);

		count.current = 2;
		expect(readonlyCount.current).toBe(2);
	});
});

describe("box types", () => {
	test("box without initial value", () => {
		const count = box<number>();
		expectTypeOf(count).toExtend<WritableBox<number | undefined>>();
		expectTypeOf(count).toExtend<ReadableBox<number | undefined>>();
	});

	test("box with initial value", () => {
		const count = box(0);
		expectTypeOf(count).toExtend<WritableBox<number>>();
		expectTypeOf(count).toExtend<ReadableBox<number>>();
	});

	test("box from writable box", () => {
		const count = box.from(box(0));
		expectTypeOf(count).toExtend<WritableBox<number>>();
	});

	test("box from readable box", () => {
		const count = box.from(box.with(() => 0));
		expectTypeOf(count).toMatchObjectType<ReadableBox<number>>();
		expectTypeOf(count).not.toMatchTypeOf<WritableBox<number>>();
	});

	test("box from box or value", () => {
		const count = 0 as number | ReadableBox<number>;
		const count2 = box.from(count);
		expectTypeOf(count2).toMatchObjectType<ReadableBox<number>>();
	});

	test("box from maybe box or getter", () => {
		const count = 0 as MaybeBoxOrGetter<number>;
		const count2 = box.from(count);
		expectTypeOf(count2).toExtend<ReadableBox<number>>();
	});

	test("box.isWritableBox = true should allow box to be settable", () => {
		const count = box(0) as WritableBox<number> | ReadableBox<number>;
		expectTypeOf(count).toExtend<ReadableBox<number>>();
		expect(box.isWritableBox(count)).toBe(true);

		if (box.isWritableBox(count)) {
			expectTypeOf(count).toExtend<WritableBox<number>>();
		}
	});

	test("box.readonly should return a non-settable box", () => {
		const count = box(0);
		const readonlyCount = box.readonly(count);
		expectTypeOf(readonlyCount).toExtend<ReadableBox<number>>();
		expectTypeOf(readonlyCount).not.toMatchTypeOf<WritableBox<number>>();
	});
});
