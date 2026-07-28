"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  position: number; // 0-100, 0 = top of image visible, 100 = bottom
  onChange: (position: number) => void;
  frameHeight?: number;
};

/**
 * Shows the full photo inside a fixed-height frame (like LinkedIn's cover
 * photo adjuster) and lets the user drag it up/down to choose which part
 * is emphasized. The resulting 0-100 value maps directly onto the same
 * `object-position: center Y%` / `background-position: center Y%` used for
 * the actual banner/hero display elsewhere on the site.
 */
export default function DragPositionEditor({
  imageUrl,
  position,
  onChange,
  frameHeight = 260,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null); // height/width
  const [top, setTop] = useState(0);
  const [dragging, setDragging] = useState(false);

  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const maxDragRef = useRef(0);

  const renderedHeight = naturalRatio ? frameWidth * naturalRatio : frameHeight;
  const maxDrag = Math.max(0, renderedHeight - frameHeight);
  maxDragRef.current = maxDrag;

  useEffect(() => {
    if (frameRef.current) setFrameWidth(frameRef.current.offsetWidth);
  }, []);

  // Sync the drag position from the saved percentage whenever we learn the
  // image's real dimensions (on load, or if frame width changes).
  useEffect(() => {
    if (naturalRatio && frameWidth) {
      const range = Math.max(0, frameWidth * naturalRatio - frameHeight);
      setTop(-(position / 100) * range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalRatio, frameWidth]);

  function handleImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setNaturalRatio(img.naturalHeight / img.naturalWidth);
  }

  function clamp(value: number) {
    return Math.min(0, Math.max(-maxDragRef.current, value));
  }

  function startDrag(clientY: number) {
    if (maxDragRef.current <= 0) return;
    setDragging(true);
    dragStartY.current = clientY;
    dragStartTop.current = top;
  }

  function moveDrag(clientY: number) {
    const delta = clientY - dragStartY.current;
    const newTop = clamp(dragStartTop.current + delta);
    setTop(newTop);
    if (maxDragRef.current > 0) {
      onChange(Math.round((-newTop / maxDragRef.current) * 100));
    }
  }

  useEffect(() => {
    if (!dragging) return;
    function onMouseMove(e: MouseEvent) {
      moveDrag(e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      moveDrag(e.touches[0].clientY);
    }
    function onEnd() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div>
      <div
        ref={frameRef}
        style={{
          position: "relative",
          width: "100%",
          height: frameHeight,
          overflow: "hidden",
          borderRadius: 8,
          border: "2px solid var(--cta-blue)",
          background: "#e4e4e4",
          cursor: maxDrag > 0 ? (dragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
        }}
        onMouseDown={(e) => startDrag(e.clientY)}
        onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Adjust position"
          onLoad={handleImgLoad}
          draggable={false}
          style={{
            position: "absolute",
            top,
            left: 0,
            width: "100%",
            height: "auto",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: "var(--grey)", marginTop: 6, textAlign: "center" }}>
        {maxDrag > 0 ? "Drag the photo up or down" : "Whole photo fits — no adjustment needed"}
      </p>
    </div>
  );
}
