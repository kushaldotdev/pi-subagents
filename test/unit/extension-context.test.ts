import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canRenderComponents, withCachedUiContext } from "../../src/shared/extension-context.ts";

describe("component UI support", () => {
	it("trusts every TUI host", () => {
		assert.equal(canRenderComponents({ mode: "tui", ui: {} } as never), true);
	});

	it("rejects the zero-arity RPC no-op stub", () => {
		const stub = async () => undefined;
		assert.equal(canRenderComponents({ mode: "rpc", ui: { custom: stub } } as never), false);
	});

	it("accepts an RPC host that implements the custom-UI contract", () => {
		const real = (_factory: unknown, _options?: unknown) => Promise.resolve(undefined);
		assert.equal(canRenderComponents({ mode: "rpc", ui: { custom: real } } as never), true);
	});
});

describe("cached extension UI context", () => {
	it("clears a context replaced by session reload and returns no UI result", () => {
		let cleared = false;
		const result = withCachedUiContext({
			get hasUI() {
				throw new Error("This extension ctx is stale after session replacement or reload.");
			},
		} as never, () => {
			cleared = true;
		}, () => "unreachable");

		assert.equal(result, undefined);
		assert.equal(cleared, true);
	});

	it("does not hide non-stale context errors", () => {
		assert.throws(() => withCachedUiContext({
			get hasUI() {
				throw new Error("UI bridge unavailable");
			},
		} as never, () => {}, () => "unreachable"), /UI bridge unavailable/);
	});
});
