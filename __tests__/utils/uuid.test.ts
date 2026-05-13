import { generateUUID } from "@/utils/uuid";

describe("generateUUID", () => {
  it("returns a v4-shaped string", () => {
    const id = generateUUID();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("returns distinct values across calls (probabilistic)", () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) set.add(generateUUID());
    expect(set.size).toBe(100);
  });
});
