"use client";

import { useState } from "react";
import { Modal, Tag } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { Scenario } from "@/types/scenario";
import { ScenarioStatus } from "@/types/scenario";
import styles from "@/styles/scenarioNavTitle.module.css";

const STATUS_LABEL: Record<ScenarioStatus, string> = {
  [ScenarioStatus.UNSTARTED]: "Not Started",
  [ScenarioStatus.UNFROZEN]: "In Progress",
  [ScenarioStatus.FROZEN]: "Frozen",
  [ScenarioStatus.COMPLETED]: "Completed",
};

const STATUS_COLOR: Record<ScenarioStatus, string> = {
  [ScenarioStatus.UNSTARTED]: "default",
  [ScenarioStatus.UNFROZEN]: "processing",
  [ScenarioStatus.FROZEN]: "warning",
  [ScenarioStatus.COMPLETED]: "success",
};

/**
 * Clickable scenario title for dashboard navbars. The title doubles as
 * the trigger that surfaces full scenario details, so every dashboard
 * (Director, Backroom, Player) gets the same affordance without each
 * page re-implementing its own modal/popover.
 */
export function ScenarioNavTitle({ scenario }: { scenario: Scenario | null }) {
  const [open, setOpen] = useState(false);

  const title = scenario?.title ?? "Loading…";
  const canOpen = !!scenario;

  return (
    <>
      <button
        type="button"
        className={styles.titleButton}
        onClick={() => canOpen && setOpen(true)}
        disabled={!canOpen}
        aria-label={canOpen ? `Show details for ${title}` : "Loading scenario"}
      >
        <span className={styles.titleText}>{title}</span>
        {canOpen && <InfoCircleOutlined className={styles.infoIcon} />}
      </button>

      <Modal
        title={
          <span className={styles.modalTitle}>
            {scenario?.title ?? "Scenario"}
          </span>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={560}
        className={styles.modalRoot}
      >
        {scenario && (
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <Tag
                color={STATUS_COLOR[scenario.status]}
                className={styles.fieldTag}
              >
                {STATUS_LABEL[scenario.status]}
              </Tag>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Day</span>
              <span className={styles.fieldValue}>
                Day {scenario.dayNumber}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Description</span>
              <p className={styles.description}>
                {scenario.description?.trim()
                  ? scenario.description
                  : "No description provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
