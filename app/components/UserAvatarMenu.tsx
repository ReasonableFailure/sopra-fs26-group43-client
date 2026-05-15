"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Input, message, Popover, Spin } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { UserService } from "@/api/userService";
import type { User, UserPutDTO } from "@/types/user";
import { portraitSrc } from "@/utils/portrait";
import styles from "@/styles/userAvatarMenu.module.css";

interface UserAvatarMenuProps {
  /** Optional class for the trigger Avatar so it matches each navbar's look. */
  avatarClassName?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

type EditField = "name" | "bio" | "pic" | null;

/**
 * Navbar avatar that opens a popover with the user's profile. Each
 * field (profile pic, name, bio) is editable on click — no global
 * "Edit" button — and the hover state on every editable element
 * makes that affordance discoverable. Saves go through PUT /users/{id}.
 */
export function UserAvatarMenu({ avatarClassName }: UserAvatarMenuProps) {
  const router = useRouter();
  const api = useApi();
  const { userId, token, logout } = useAuth();
  const userService = useMemo(() => new UserService(api), [api]);

  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  // Only one field is in edit mode at a time. Keeping it scalar instead
  // of three booleans makes the "exit current edit" logic trivial.
  const [editing, setEditing] = useState<EditField>(null);
  const [draftName, setDraftName] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftPic, setDraftPic] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const lastUserRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refetchUser = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const fresh = await userService.getUser(userId, token);
      setUser(fresh);
      // Only reset draft fields on a *new* user load — otherwise a
      // background refresh while the user is mid-edit would clobber
      // their input.
      if (lastUserRef.current !== fresh.id) {
        setDraftName(fresh.name ?? "");
        setDraftBio(fresh.bio ?? "");
        setDraftPic(fresh.profilePic ?? null);
        lastUserRef.current = fresh.id;
      }
    } catch {
      // Silent: the navbar avatar shouldn't toast about background
      // refresh failures.
    }
  }, [userId, token, userService]);

  useEffect(() => {
    if (!userId || !token) {
      setUser(null);
      lastUserRef.current = null;
      return;
    }
    refetchUser();
  }, [userId, token, refetchUser]);

  const displayPic = portraitSrc(user?.profilePic ?? null);
  const previewPic = portraitSrc(
    editing === "pic" ? draftPic : (user?.profilePic ?? null),
  );

  const startEdit = (field: Exclude<EditField, null>) => {
    if (!user) return;
    // Re-seed the draft from current server state so the editor always
    // starts from the latest persisted value, not a stale draft.
    if (field === "name") {
      setDraftName(user.name ?? "");
      setEditing("name");
      return;
    }
    if (field === "bio") {
      setDraftBio(user.bio ?? "");
      setEditing("bio");
      return;
    }
    // "pic": the file picker is the entry point. The Save/Cancel
    // buttons only appear once the user actually selects a file
    // (handleFileSelect flips `editing` to "pic" at that point).
    setDraftPic(user.profilePic ?? null);
    fileInputRef.current?.click();
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraftName(user?.name ?? "");
    setDraftBio(user?.bio ?? "");
    setDraftPic(user?.profilePic ?? null);
  };

  const saveField = async (field: Exclude<EditField, null>) => {
    if (!userId || !token) return;
    setSaving(true);
    try {
      const dto: UserPutDTO = {};
      if (field === "name") dto.name = draftName;
      if (field === "bio") dto.bio = draftBio;
      if (field === "pic") dto.profilePic = draftPic ?? "";
      await userService.updateUser(userId, dto, token);
      await refetchUser();
      setEditing(null);
      message.success("Profile updated");
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file twice still fires onChange.
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      message.error("Image must be smaller than 2MB");
      return;
    }
    const dataUrl = await fileToBase64(file);
    setDraftPic(dataUrl);
    setEditing("pic");
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/login");
  };

  const content = (
    <div style={{ width: 200 }}>
      {!user
        ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin />
          </div>
        )
        : (
          <>
            {/* Hidden file input — triggered by clicking the avatar. */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                className={styles.avatarEditable}
                onClick={() => startEdit("pic")}
                role="button"
                aria-label="Change profile picture"
              >
                <Avatar
                  size={72}
                  src={previewPic ?? undefined}
                  icon={!previewPic ? <UserOutlined /> : undefined}
                />
                <span className={styles.avatarHint}>Change</span>
              </span>
            </div>

            {editing === "pic" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Button onClick={cancelEdit} disabled={saving} size="small">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => saveField("pic")}
                  loading={saving}
                  size="small"
                >
                  Save
                </Button>
              </div>
            )}

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Username
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                {user.username ?? "—"}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Name
              </div>
              {editing === "name"
                ? (
                  <div style={{ marginBottom: 12 }}>
                    <Input
                      value={draftName}
                      autoFocus
                      onChange={(e) => setDraftName(e.target.value)}
                      onPressEnter={() => saveField("name")}
                      placeholder="Your display name"
                      style={{ textAlign: "center", marginBottom: 8 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Button
                        onClick={cancelEdit}
                        disabled={saving}
                        size="small"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => saveField("name")}
                        loading={saving}
                        size="small"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )
                : (
                  <div
                    className={styles.editable}
                    onClick={() => startEdit("name")}
                    role="button"
                    aria-label="Edit name"
                    style={{
                      fontSize: 14,
                      color: user.name ? "#111827" : "#9ca3af",
                      marginBottom: 12,
                    }}
                  >
                    {user.name && user.name.length > 0
                      ? user.name
                      : "Click to add name"}
                  </div>
                )}

              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Bio
              </div>
              {editing === "bio"
                ? (
                  <div style={{ marginBottom: 12 }}>
                    <Input.TextArea
                      value={draftBio}
                      autoFocus
                      onChange={(e) => setDraftBio(e.target.value)}
                      placeholder="Tell others a bit about yourself"
                      autoSize={{ minRows: 2, maxRows: 5 }}
                      style={{ marginBottom: 8 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Button
                        onClick={cancelEdit}
                        disabled={saving}
                        size="small"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => saveField("bio")}
                        loading={saving}
                        size="small"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )
                : (
                  <div
                    className={styles.editable}
                    onClick={() => startEdit("bio")}
                    role="button"
                    aria-label="Edit bio"
                    style={{
                      fontSize: 14,
                      color: user.bio ? "#111827" : "#9ca3af",
                      whiteSpace: "pre-wrap",
                      marginBottom: 12,
                    }}
                  >
                    {user.bio && user.bio.length > 0
                      ? user.bio
                      : "Click to add bio"}
                  </div>
                )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
              }}
            >
              <Button
                icon={<LogoutOutlined />}
                danger
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          </>
        )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={(next) => {
        if (!next && editing) {
          // Cancel any in-progress edit when the user dismisses the menu.
          cancelEdit();
        }
        setOpen(next);
      }}
      placement="bottomRight"
    >
      <Avatar
        className={avatarClassName}
        src={displayPic ?? undefined}
        icon={!displayPic ? <UserOutlined /> : undefined}
        style={{ cursor: "pointer" }}
      />
    </Popover>
  );
}
