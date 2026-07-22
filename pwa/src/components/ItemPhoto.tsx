import { useEffect, useState } from "react";
import { getPhotoUrl } from "../data/cloud/photos";

// Renders an item photo from its storage path via a short-lived signed URL
// (the bucket is private). Renders nothing until/unless a URL resolves.
export function ItemPhoto({ path, size = 44 }: { path: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getPhotoUrl(path)
      .then((u) => active && setUrl(u))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return null;
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      style={{ objectFit: "cover", borderRadius: 10, flex: "0 0 auto" }}
    />
  );
}
