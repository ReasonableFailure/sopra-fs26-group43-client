import { CommsStatus } from "@/types/directive";
import { ScenarioStatus } from "@/types/scenario";
import type { ScenarioClientConfig } from "@/types/scenario";

describe("Type enums", () => {
  it("CommsStatus exposes the four expected values", () => {
    expect(Object.values(CommsStatus).sort()).toEqual(
      ["ACCEPTED", "FAILED", "PENDING", "REJECTED"].sort(),
    );
  });

  it("ScenarioStatus exposes the four expected values", () => {
    expect(Object.values(ScenarioStatus).sort()).toEqual(
      ["COMPLETED", "FROZEN", "UNFROZEN", "UNSTARTED"].sort(),
    );
  });

  it("ScenarioClientConfig is structurally usable for max-backroomers + code", () => {
    const cfg: ScenarioClientConfig = {
      maxBackroomers: 3,
      backroomerCode: "alpha",
    };
    expect(cfg.maxBackroomers).toBe(3);
    expect(cfg.backroomerCode).toBe("alpha");
  });
});
