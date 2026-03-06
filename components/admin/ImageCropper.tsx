"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ImageCropperProps {
  file: File;
  onCrop: (file: File, crop: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cw = containerRect.width;
    const ch = 400; // max height

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ w: nw, h: nh });

    // Calculer la taille d'affichage réelle (comme object-fit: contain)
    const scale = Math.min(cw / nw, ch / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    setDisplaySize({ w: dw, h: dh });

    // Offset pour centrer l'image dans le container
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;
    setOffset({ x: ox, y: oy });

    // Cadre initial : 70% de la plus petite dimension, centré
    const cropSize = Math.min(dw, dh) * 0.7;
    setCropBox({
      x: ox + (dw - cropSize) / 2,
      y: oy + (dh - cropSize) / 2,
      size: cropSize,
    });
  }, []);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const clampCrop = (x: number, y: number, size: number) => {
    const minX = offset.x;
    const minY = offset.y;
    const maxX = offset.x + displaySize.w - size;
    const maxY = offset.y + displaySize.h - size;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
      size,
    };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getEventPos(e);
    setDragging(true);
    setDragStart({ x: pos.x, y: pos.y, cropX: cropBox.x, cropY: cropBox.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getEventPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    setCropBox(clampCrop(dragStart.cropX + dx, dragStart.cropY + dy, cropBox.size));
  };

  const handleDragEnd = () => setDragging(false);

  const handleSizeChange = (delta: number) => {
    setCropBox((prev) => {
      const minSize = 40;
      const maxSize = Math.min(displaySize.w, displaySize.h);
      const newSize = Math.max(minSize, Math.min(maxSize, prev.size + delta));
      // Recentrer le pivot
      const cx = prev.x + prev.size / 2;
      const cy = prev.y + prev.size / 2;
      return clampCrop(cx - newSize / 2, cy - newSize / 2, newSize);
    });
  };

  const handleConfirm = () => {
    if (!naturalSize.w) return;

    // Convertir les coordonnées d'affichage en coordonnées réelles
    const scale = naturalSize.w / displaySize.w;
    const realX = (cropBox.x - offset.x) * scale;
    const realY = (cropBox.y - offset.y) * scale;
    const realSize = cropBox.size * scale;

    onCrop(file, {
      x: Math.max(0, Math.round(realX)),
      y: Math.max(0, Math.round(realY)),
      width: Math.round(Math.min(realSize, naturalSize.w - realX)),
      height: Math.round(Math.min(realSize, naturalSize.h - realY)),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Déplace le cadre carré pour recadrer ta photo de profil.
      </p>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-black select-none touch-none"
        style={{ height: "400px" }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Aperçu"
            className="absolute"
            style={{
              left: offset.x,
              top: offset.y,
              width: displaySize.w || "auto",
              height: displaySize.h || "auto",
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />
        )}

        {/* Cadre de sélection avec overlay */}
        {displaySize.w > 0 && (
          <div
            className="absolute border-2 border-white rounded-lg cursor-move z-10"
            style={{
              left: cropBox.x,
              top: cropBox.y,
              width: cropBox.size,
              height: cropBox.size,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
            {/* Grille de tiers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
            </div>
          </div>
        )}
      </div>

      {/* Contrôles de taille */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleSizeChange(-30)}
          className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
        >
          −
        </button>
        <span className="text-xs text-gray-500 w-20 text-center">Taille</span>
        <button
          type="button"
          onClick={() => handleSizeChange(30)}
          className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
        >
          +
        </button>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
          Valider
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Annuler
        </button>
      </div>
    </div>
  );
}
