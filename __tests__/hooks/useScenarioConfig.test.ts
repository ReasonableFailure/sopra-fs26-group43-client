import { act, renderHook } from "@testing-library/react";
import { useScenarioConfig } from "@/hooks/useScenarioConfig";

describe("useScenarioConfig", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("returns the default config (2 max, empty code) when nothing is stored", () => {
    const { result } = renderHook(() => useScenarioConfig(1));
    expect(result.current.config.maxBackroomers).toBe(2);
    expect(result.current.config.backroomerCode).toBe("");
    expect(result.current.joined).toBe(0);
  });

  it("updateConfig merges partial updates into the stored config", () => {
    const { result } = renderHook(() => useScenarioConfig(1));
    act(() => {
      result.current.updateConfig({ maxBackroomers: 4 });
    });
    expect(result.current.config.maxBackroomers).toBe(4);
    expect(result.current.config.backroomerCode).toBe("");
    act(() => {
      result.current.updateConfig({ backroomerCode: "alpha" });
    });
    expect(result.current.config.maxBackroomers).toBe(4);
    expect(result.current.config.backroomerCode).toBe("alpha");
  });

  it("isCodeCorrect denies access when director has not set a code", () => {
    const { result } = renderHook(() => useScenarioConfig(1));
    expect(result.current.isCodeCorrect("")).toBe(false);
    expect(result.current.isCodeCorrect("anything")).toBe(false);
  });

  it("isCodeCorrect accepts only the configured code (whitespace tolerant)", () => {
    const { result } = renderHook(() => useScenarioConfig(1));
    act(() => {
      result.current.updateConfig({ backroomerCode: "secret-7" });
    });
    expect(result.current.isCodeCorrect("secret-7")).toBe(true);
    expect(result.current.isCodeCorrect("  secret-7  ")).toBe(true);
    expect(result.current.isCodeCorrect("Secret-7")).toBe(false);
    expect(result.current.isCodeCorrect("nope")).toBe(false);
  });

  it("canJoinBackroom returns true under the limit and false at/over the limit", () => {
    const { result } = renderHook(() => useScenarioConfig(42));
    act(() => {
      result.current.updateConfig({ maxBackroomers: 2 });
    });
    expect(result.current.canJoinBackroom()).toBe(true);
    act(() => {
      result.current.registerBackroomerJoin();
    });
    expect(result.current.canJoinBackroom()).toBe(true);
    act(() => {
      result.current.registerBackroomerJoin();
    });
    expect(result.current.canJoinBackroom()).toBe(false);
    expect(result.current.joined).toBe(2);
  });

  it("config is scoped by scenarioId", () => {
    const { result: s1 } = renderHook(() => useScenarioConfig(1));
    act(() => {
      s1.current.updateConfig({ maxBackroomers: 5, backroomerCode: "one" });
    });
    const { result: s2 } = renderHook(() => useScenarioConfig(2));
    expect(s2.current.config.maxBackroomers).toBe(2); // default
    expect(s2.current.config.backroomerCode).toBe("");
  });
});
