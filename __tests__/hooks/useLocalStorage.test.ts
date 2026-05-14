import { act, renderHook } from "@testing-library/react";
import useLocalStorage from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("returns the default value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage<number>("counter", 0));
    expect(result.current.value).toBe(0);
  });

  it("hydrates from localStorage after mount", () => {
    globalThis.localStorage.setItem("counter", JSON.stringify(42));
    const { result } = renderHook(() => useLocalStorage<number>("counter", 0));
    expect(result.current.value).toBe(42);
    expect(result.current.ready).toBe(true);
  });

  it("set() updates state and persists to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage<string>("name", ""));
    act(() => {
      result.current.set("Yiru");
    });
    expect(result.current.value).toBe("Yiru");
    expect(globalThis.localStorage.getItem("name")).toBe(JSON.stringify("Yiru"));
  });

  it("clear() resets to the default and removes the key", () => {
    const { result } = renderHook(() => useLocalStorage<string>("name", ""));
    act(() => {
      result.current.set("Yiru");
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.value).toBe("");
    expect(globalThis.localStorage.getItem("name")).toBeNull();
  });

  it("handles complex object values via JSON round-trip", () => {
    interface Profile {
      name: string;
      tags: string[];
    }
    const { result } = renderHook(() =>
      useLocalStorage<Profile>("profile", { name: "", tags: [] })
    );
    act(() => {
      result.current.set({ name: "Yiru", tags: ["director", "yiruyang2025"] });
    });
    const raw = globalThis.localStorage.getItem("profile");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({
      name: "Yiru",
      tags: ["director", "yiruyang2025"],
    });
  });
});
