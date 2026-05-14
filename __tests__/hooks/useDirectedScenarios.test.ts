import { act, renderHook } from "@testing-library/react";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";

describe("useDirectedScenarios", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("starts with an empty director set for a fresh user", () => {
    const { result } = renderHook(() => useDirectedScenarios(1));
    expect(result.current.isDirector(123)).toBe(false);
  });

  it("addDirectedScenario marks the user as director for that scenario", () => {
    const { result } = renderHook(() => useDirectedScenarios(1));
    act(() => {
      result.current.addDirectedScenario(7);
    });
    expect(result.current.isDirector(7)).toBe(true);
    expect(result.current.isDirector(99)).toBe(false);
  });

  it("adding the same scenario twice does not duplicate", () => {
    const { result } = renderHook(() => useDirectedScenarios(1));
    act(() => {
      result.current.addDirectedScenario(7);
      result.current.addDirectedScenario(7);
    });
    const raw = globalThis.localStorage.getItem("directedScenarios_1");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual([7]);
  });

  it("director assignments are scoped per userId", () => {
    const { result: user1 } = renderHook(() => useDirectedScenarios(1));
    act(() => {
      user1.current.addDirectedScenario(7);
    });
    const { result: user2 } = renderHook(() => useDirectedScenarios(2));
    expect(user2.current.isDirector(7)).toBe(false);
  });

  it("falls back to the guest namespace when userId is null", () => {
    const { result } = renderHook(() => useDirectedScenarios(null));
    act(() => {
      result.current.addDirectedScenario(7);
    });
    expect(globalThis.localStorage.getItem("directedScenarios_guest")).toBe(
      JSON.stringify([7]),
    );
  });
});
