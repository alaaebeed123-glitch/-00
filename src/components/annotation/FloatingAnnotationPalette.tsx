import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  GripVertical,
  Keyboard,
  MousePointer2,
  PenTool,
  Redo2,
  SlidersHorizontal,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import {
  useAnnotationActions,
  useAnnotationDockState,
  useAnnotationToolState,
} from './AnnotationContext';
import {
  APPLE_HIGHLIGHTER_COLORS,
  APPLE_LASER_COLORS,
  APPLE_PEN_COLORS,
  SIZE_DIAL_MAX,
  SIZE_DIAL_MIN,
  SIZE_DIAL_STEP,
  pxToSizeLevel,
  sizeLevelToPx,
  snapSizeLevel,
  type AnnotationTool,
  type SizableAnnotationTool,
} from './types';
import { toArabicDigits } from '../../utils/mushafData';

/**
 * Refined, wider Apple PencilKit-grade studio illustrations (viewBox 48x92).
 * Fuller cylindrical barrels with soft directional studio shading, hairline material transitions,
 * and deep continuous stems that stay solidly rooted into the dock's bottom rim even when active.
 */
const ApplePenNibSvg: React.FC<{ color: string; sizeLevel: number }> = ({ color, sizeLevel }) => {
  const gaugeRadius = Math.max(1.7, Math.min(3.8, 1.7 + ((sizeLevel - 5) / 95) * 2.1));

  return (
    <svg className="apple-nib-svg" viewBox="0 0 48 92" fill="none" aria-hidden="true">
      {/* Sculpted matte-porcelain conical nose */}
      <path
        d="M24 4.2C24.65 4.2 25.25 4.65 25.55 5.42L33.2 23.6H14.8L22.45 5.42C22.75 4.65 23.35 4.2 24 4.2Z"
        fill="url(#pkPenCone)"
        stroke="rgba(15, 23, 42, 0.1)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Soft curved specular highlight along left-center of cone */}
      <path d="M22.7 8.4L17.6 22.9H19.8L23.5 8.6Z" fill="rgba(255, 255, 255, 0.62)" />
      {/* Precision color-matched ink nib */}
      <path
        d="M24 3.95C24.5 3.95 24.98 4.35 25.24 5.02L27.55 11.7C25.25 12.38 22.75 12.38 20.45 11.7L22.76 5.02C23.02 4.35 23.5 3.95 24 3.95Z"
        fill={color}
      />
      <path
        d="M23.4 5.5L22.0 10.8C22.5 10.95 22.95 11.0 23.35 11.0L23.95 5.55Z"
        fill="rgba(255, 255, 255, 0.36)"
      />
      {/* Brushed satin-aluminum collar */}
      <path
        d="M14.65 23.6H33.35L33.7 26.4H14.3L14.65 23.6Z"
        fill="url(#pkPenFerrule)"
        stroke="rgba(15, 23, 42, 0.09)"
        strokeWidth="0.65"
      />
      {/* Fuller rooted matte-ceramic barrel */}
      <path
        d="M14.3 26.4H33.7L34.9 96H13.1L14.3 26.4Z"
        fill="url(#pkPenBarrel)"
        stroke="rgba(15, 23, 42, 0.09)"
        strokeWidth="0.7"
      />
      {/* Signature cylindrical live-color ink band + delicate hairline trim */}
      <rect x="14.15" y="29.2" width="19.7" height="5.4" rx="1.2" fill={color} opacity="0.94" />
      <rect x="14.15" y="29.2" width="19.7" height="5.4" rx="1.2" fill="url(#pkCylWrap)" />
      <rect x="14.2" y="36.2" width="19.6" height="1.25" rx="0.6" fill={color} opacity="0.34" />
      {/* Subtle live-size indicator dot centered on the porcelain body */}
      <circle cx="24" cy="45.2" r={gaugeRadius} fill={color} opacity="0.82" />
      {/* Silky studio cylinder highlight */}
      <rect x="17.6" y="27.2" width="2.8" height="66" rx="1.4" fill="rgba(255, 255, 255, 0.34)" />
      <defs>
        <linearGradient id="pkPenCone" x1="14.8" y1="14" x2="33.2" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DFE7F0" />
          <stop offset="0.3" stopColor="#FFFFFF" />
          <stop offset="0.66" stopColor="#F5F7FA" />
          <stop offset="0.9" stopColor="#CFD9E5" />
          <stop offset="1" stopColor="#E1E8F0" />
        </linearGradient>
        <linearGradient id="pkPenFerrule" x1="14.3" y1="25" x2="33.7" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4CFD9" />
          <stop offset="0.32" stopColor="#F8FAFC" />
          <stop offset="0.68" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#AEBCCA" />
        </linearGradient>
        <linearGradient id="pkPenBarrel" x1="13.1" y1="58" x2="34.9" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4EAF2" />
          <stop offset="0.28" stopColor="#FFFFFF" />
          <stop offset="0.64" stopColor="#F8FAFC" />
          <stop offset="0.9" stopColor="#D6DFE9" />
          <stop offset="1" stopColor="#E6ECF4" />
        </linearGradient>
        <linearGradient id="pkCylWrap" x1="14.15" y1="31.9" x2="33.85" y2="31.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(15, 23, 42, 0.14)" />
          <stop offset="0.28" stopColor="rgba(255, 255, 255, 0.28)" />
          <stop offset="0.62" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="0.9" stopColor="rgba(15, 23, 42, 0.16)" />
          <stop offset="1" stopColor="rgba(255, 255, 255, 0.08)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const AppleHighlighterNibSvg: React.FC<{ color: string; sizeLevel: number }> = ({
  color,
  sizeLevel,
}) => {
  const ribbonHeight = Math.max(2.6, Math.min(7.2, 2.6 + ((sizeLevel - 5) / 95) * 4.6));
  const ribbonY = 41.2 - ribbonHeight / 2;

  return (
    <svg className="apple-nib-svg" viewBox="0 0 48 92" fill="none" aria-hidden="true">
      {/* Wide authentic beveled chisel felt tip */}
      <path
        d="M15.6 10.6L31.4 5.2C32.3 4.88 33.2 5.5 33.28 6.45L33.8 18.2H14.2L14.85 11.85C14.94 11.24 15.2 10.76 15.6 10.6Z"
        fill={color}
        opacity="0.93"
        stroke="rgba(15, 23, 42, 0.11)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Felt chisel bevel sheen */}
      <path d="M16.1 10.9L31.2 5.75L32.4 8.2L16.25 13.5Z" fill="rgba(255, 255, 255, 0.38)" />
      <rect x="14.25" y="17.1" width="19.5" height="1.1" fill="rgba(15, 23, 42, 0.08)" />
      {/* Broad sculptural ergonomic shoulder */}
      <path
        d="M13.2 18.2H34.8L37.4 26.8H10.6L13.2 18.2Z"
        fill="url(#pkHlShoulder)"
        stroke="rgba(15, 23, 42, 0.09)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Satin machined neck collar */}
      <rect
        x="10.5"
        y="25.6"
        width="27"
        height="2.2"
        rx="0.8"
        fill="url(#pkHlRing)"
        stroke="rgba(15, 23, 42, 0.08)"
        strokeWidth="0.6"
      />
      {/* Broad rooted matte-porcelain highlighter body */}
      <path
        d="M10.6 27.6H37.4L38.4 96H9.6L10.6 27.6Z"
        fill="url(#pkHlBarrel)"
        stroke="rgba(15, 23, 42, 0.09)"
        strokeWidth="0.7"
      />
      {/* Satin translucent color sleeve with soft cylinder wrap */}
      <rect x="10.5" y="30.8" width="27" height="20.6" rx="2.6" fill={color} opacity="0.85" />
      <rect x="10.5" y="30.8" width="27" height="20.6" rx="2.6" fill="url(#pkHlSleeveGloss)" />
      {/* Clean live chisel-width indicator ribbon */}
      <path
        d={`M16.6 ${ribbonY + 1.3}L31.8 ${ribbonY - 0.9}L31.0 ${ribbonY + ribbonHeight - 0.9}L15.8 ${ribbonY + ribbonHeight + 1.3}Z`}
        fill="rgba(255, 255, 255, 0.8)"
      />
      {/* Subtle porcelain vertical highlight */}
      <rect x="14.4" y="28.8" width="3" height="64" rx="1.5" fill="rgba(255, 255, 255, 0.28)" />
      <defs>
        <linearGradient id="pkHlShoulder" x1="10.6" y1="22.5" x2="37.4" y2="22.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DFE7F0" />
          <stop offset="0.3" stopColor="#FFFFFF" />
          <stop offset="0.66" stopColor="#F5F7FA" />
          <stop offset="0.9" stopColor="#D0DAE6" />
          <stop offset="1" stopColor="#E1E8F0" />
        </linearGradient>
        <linearGradient id="pkHlRing" x1="10.5" y1="26.7" x2="37.5" y2="26.7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4CFD9" />
          <stop offset="0.32" stopColor="#F8FAFC" />
          <stop offset="0.68" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#AEBCCA" />
        </linearGradient>
        <linearGradient id="pkHlBarrel" x1="9.6" y1="60" x2="38.4" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4EAF2" />
          <stop offset="0.28" stopColor="#FFFFFF" />
          <stop offset="0.64" stopColor="#F8FAFC" />
          <stop offset="0.9" stopColor="#D6DFE9" />
          <stop offset="1" stopColor="#E6ECF4" />
        </linearGradient>
        <linearGradient id="pkHlSleeveGloss" x1="10.5" y1="41" x2="37.5" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(15, 23, 42, 0.1)" />
          <stop offset="0.26" stopColor="rgba(255, 255, 255, 0.32)" />
          <stop offset="0.6" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="0.9" stopColor="rgba(15, 23, 42, 0.12)" />
          <stop offset="1" stopColor="rgba(255, 255, 255, 0.08)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const AppleLaserStylusSvg: React.FC<{
  color: string;
  sizeLevel: number;
  isActive: boolean;
}> = ({ color, sizeLevel, isActive }) => {
  const haloRadius = (isActive ? 8.2 : 5.8) + ((sizeLevel - 5) / 95) * 1.8;

  return (
    <svg className="apple-nib-svg" viewBox="0 0 48 92" fill="none" aria-hidden="true">
      {/* Calm optical aura around glass emitter lens */}
      <circle cx="24" cy="9.6" r={haloRadius} fill="url(#pkLaserHalo)" opacity={isActive ? 0.68 : 0.36} />
      <circle cx="24" cy="9.6" r={haloRadius * 0.56} fill={color} opacity={isActive ? 0.24 : 0.14} />
      {/* Precision glass optical lens */}
      <circle cx="24" cy="9.6" r="3.8" fill={color} opacity="0.94" />
      <circle cx="23.15" cy="8.75" r="1.25" fill="#FFFFFF" opacity="0.94" />
      {/* Chamfered brushed-titanium emitter crown */}
      <path
        d="M17.8 14.4H30.2L33 24.2H15L17.8 14.4Z"
        fill="url(#pkLaserCrown)"
        stroke="rgba(15, 23, 42, 0.14)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <line x1="16.7" y1="19" x2="31.3" y2="19" stroke="rgba(15, 23, 42, 0.12)" strokeWidth="0.7" />
      {/* Substantial rooted Space-Gray anodized aluminum presenter barrel */}
      <path
        d="M15 24.2H33L34.2 96H13.8L15 24.2Z"
        fill="url(#pkLaserBody)"
        stroke="rgba(15, 23, 42, 0.18)"
        strokeWidth="0.7"
      />
      {/* Crisp recessed color-matched optical accent ring */}
      <rect x="14.85" y="27.8" width="18.3" height="3.2" rx="1.4" fill={color} opacity="0.92" />
      <rect x="14.85" y="27.8" width="18.3" height="3.2" rx="1.4" fill="url(#pkLaserRingSheen)" />
      {/* Minimalist flush pill presenter trigger */}
      <rect
        x="20.4"
        y="36.4"
        width="7.2"
        height="14.6"
        rx="3.6"
        fill="url(#pkLaserBtn)"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth="0.75"
      />
      <circle cx="24" cy="41.4" r="1.4" fill={color} opacity={isActive ? 0.96 : 0.65} />
      {/* Subtle anodized specular highlight strip */}
      <rect x="17.8" y="25.2" width="2.3" height="68" rx="1.15" fill="rgba(255, 255, 255, 0.12)" />
      <defs>
        <radialGradient id="pkLaserHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 9.6) rotate(90) scale(10)">
          <stop stopColor="#FFFFFF" stopOpacity="0.68" />
          <stop offset="0.38" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pkLaserCrown" x1="15" y1="19.3" x2="33" y2="19.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFCAD6" />
          <stop offset="0.3" stopColor="#F8FAFC" />
          <stop offset="0.66" stopColor="#DCE3EC" />
          <stop offset="0.92" stopColor="#97A5B5" />
          <stop offset="1" stopColor="#B6C2CF" />
        </linearGradient>
        <linearGradient id="pkLaserBody" x1="13.8" y1="58" x2="34.2" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B485A" />
          <stop offset="0.28" stopColor="#6D7E94" />
          <stop offset="0.58" stopColor="#49576B" />
          <stop offset="0.88" stopColor="#2A3546" />
          <stop offset="1" stopColor="#425064" />
        </linearGradient>
        <linearGradient id="pkLaserRingSheen" x1="14.8" y1="29.4" x2="33.2" y2="29.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(0,0,0,0.16)" />
          <stop offset="0.3" stopColor="rgba(255,255,255,0.32)" />
          <stop offset="0.9" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
        <linearGradient id="pkLaserBtn" x1="20.4" y1="43.7" x2="27.6" y2="43.7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#475569" />
          <stop offset="0.38" stopColor="#64748B" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const AppleEraserNibSvg: React.FC<{ sizeLevel: number }> = ({ sizeLevel }) => {
  const gaugeWidth = Math.max(5.6, Math.min(13.6, 5.6 + ((sizeLevel - 5) / 95) * 8.0));

  return (
    <svg className="apple-nib-svg" viewBox="0 0 48 92" fill="none" aria-hidden="true">
      {/* Fuller iconic iPadOS rounded architectural rubber head */}
      <path
        d="M13.6 11.4C13.6 7.8 16.4 5.4 20 5.4H28C31.6 5.4 34.4 7.8 34.4 11.4V24.6H13.6V11.4Z"
        fill="url(#pkEraserRubber)"
        stroke="rgba(190, 24, 93, 0.13)"
        strokeWidth="0.7"
      />
      {/* Soft top shoulder crown highlight */}
      <path
        d="M15.6 9.5C16.3 7.6 17.9 6.6 20.1 6.6H27.9C29.7 6.6 31.1 7.2 31.9 8.5C29.6 9.1 26.8 9.5 24 9.5C20.9 9.5 18 9.8 15.6 9.5Z"
        fill="rgba(255, 255, 255, 0.54)"
      />
      <rect x="16" y="10.2" width="2.6" height="12.8" rx="1.3" fill="rgba(255, 255, 255, 0.36)" />
      {/* Precision brushed-aluminum ferrule band */}
      <rect
        x="12.4"
        y="24.2"
        width="23.2"
        height="6.8"
        rx="1.6"
        fill="url(#pkEraserFerrule)"
        stroke="rgba(15, 23, 42, 0.1)"
        strokeWidth="0.7"
      />
      <line x1="13.2" y1="26.6" x2="34.8" y2="26.6" stroke="rgba(15, 23, 42, 0.1)" strokeWidth="0.65" />
      <line x1="13.2" y1="28.9" x2="34.8" y2="28.9" stroke="rgba(15, 23, 42, 0.09)" strokeWidth="0.65" />
      {/* Broad rooted matte-porcelain architectural sleeve */}
      <path
        d="M12.6 31H35.4L36.5 96H11.5L12.6 31Z"
        fill="url(#pkEraserSleeve)"
        stroke="rgba(15, 23, 42, 0.09)"
        strokeWidth="0.7"
      />
      {/* Delicate live-size blush indicator bar */}
      <rect
        x={24 - gaugeWidth / 2}
        y="40.8"
        width={gaugeWidth}
        height="3.4"
        rx="1.7"
        fill="#E891B3"
        opacity="0.68"
      />
      <rect x="15.8" y="32.2" width="2.8" height="61" rx="1.4" fill="rgba(255, 255, 255, 0.32)" />
      <defs>
        <linearGradient id="pkEraserRubber" x1="13.6" y1="15" x2="34.4" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3C1D4" />
          <stop offset="0.3" stopColor="#FFF7FA" />
          <stop offset="0.66" stopColor="#FCE4ED" />
          <stop offset="0.9" stopColor="#E7A7C0" />
          <stop offset="1" stopColor="#F0BED1" />
        </linearGradient>
        <linearGradient id="pkEraserFerrule" x1="12.4" y1="27.6" x2="35.6" y2="27.6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4CFD9" />
          <stop offset="0.32" stopColor="#F8FAFC" />
          <stop offset="0.68" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#AEBCCA" />
        </linearGradient>
        <linearGradient id="pkEraserSleeve" x1="11.5" y1="62" x2="36.5" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4EAF2" />
          <stop offset="0.28" stopColor="#FFFFFF" />
          <stop offset="0.64" stopColor="#F8FAFC" />
          <stop offset="0.9" stopColor="#D6DFE9" />
          <stop offset="1" stopColor="#E6ECF4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * Single Unified External Dock Thickness Roller (5%..100% in 20 crisp 5% magnetic detents).
 * Sits directly on the floating dock exterior and dynamically adapts to whichever tool is active
 * (Pen, Highlighter, Laser, or Eraser) while keeping each tool's saved thickness independent.
 * - Tap anywhere along the recessed track to snap immediately to that 5% stop
 * - Glide horizontally in natural Arabic RTL flow (٥٪ right -> ١٠٠٪ left) in one smooth sweep
 * - Roll mouse wheel anywhere over the roller to step +/-5% without scrolling the Mushaf
 * - Shows a crisp floating true-scale live tip preview while adjusting
 */
const DIAL_STOPS = Array.from(
  { length: (SIZE_DIAL_MAX - SIZE_DIAL_MIN) / SIZE_DIAL_STEP + 1 },
  (_, i) => SIZE_DIAL_MIN + i * SIZE_DIAL_STEP
);
const DOCK_ROLLER_INSET_PX = 13;

const TOOL_SHORT_NAMES: Record<SizableAnnotationTool, string> = {
  pen: 'القلم',
  highlighter: 'التظليل',
  laser: 'الليزر',
  eraser: 'الممحاة',
};

const TOOL_SIZE_TITLES: Record<SizableAnnotationTool, string> = {
  pen: 'سُمك القلم',
  highlighter: 'عرض التظليل',
  laser: 'سُمك الليزر',
  eraser: 'حجم الممحاة',
};

interface DockThicknessRollerProps {
  tool: SizableAnnotationTool;
  isStandby: boolean;
  isPulsing: boolean;
  suppressPreview: boolean;
  value: number;
  color: string;
  onActivateTool: () => void;
  onChange: (nextLevel: number) => void;
}

const DockThicknessRoller: React.FC<DockThicknessRollerProps> = ({
  tool,
  isStandby,
  isPulsing,
  suppressPreview,
  value,
  color,
  onActivateTool,
  onChange,
}) => {
  const snappedValue = snapSizeLevel(value);
  const [isDraggingDial, setIsDraggingDial] = useState(false);
  const [isTransientPreview, setIsTransientPreview] = useState(false);

  const rollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(snappedValue);
  valueRef.current = snappedValue;

  const isStandbyRef = useRef(isStandby);
  isStandbyRef.current = isStandby;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onActivateToolRef = useRef(onActivateTool);
  onActivateToolRef.current = onActivateTool;

  const wheelAccumRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  const flashPreviewCallout = useCallback(() => {
    setIsTransientPreview(true);
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
    }
    previewTimerRef.current = window.setTimeout(() => {
      setIsTransientPreview(false);
      previewTimerRef.current = null;
    }, 760);
  }, []);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const commitValue = useCallback(
    (next: number, showTransient = false) => {
      if (isStandbyRef.current) {
        onActivateToolRef.current();
      }
      const snapped = snapSizeLevel(next);
      if (snapped !== valueRef.current) {
        valueRef.current = snapped;
        onChangeRef.current(snapped);
      }
      if (showTransient) {
        flashPreviewCallout();
      }
    },
    [flashPreviewCallout]
  );

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      const usable = Math.max(1, rect.width - DOCK_ROLLER_INSET_PX * 2);
      // Natural Arabic RTL flow: 5% sits on the right edge, 100% on the left edge
      const progress = Math.max(
        0,
        Math.min(1, (rect.right - DOCK_ROLLER_INSET_PX - clientX) / usable)
      );
      const rawLevel = SIZE_DIAL_MIN + progress * (SIZE_DIAL_MAX - SIZE_DIAL_MIN);
      commitValue(rawLevel, false);
    },
    [commitValue]
  );

  // Native non-passive wheel listener over the roller bay so scrolling steps +/-5%
  // cleanly without scrolling the Mushaf page behind the dock.
  useEffect(() => {
    const el = rollerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const primaryDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY;
      if (primaryDelta === 0) return;

      if (Math.abs(primaryDelta) >= 36) {
        wheelAccumRef.current = 0;
        const dir = primaryDelta > 0 ? 1 : -1;
        commitValue(valueRef.current + dir * SIZE_DIAL_STEP, true);
        return;
      }

      wheelAccumRef.current += primaryDelta;
      const threshold = 24;
      if (Math.abs(wheelAccumRef.current) >= threshold) {
        const steps = Math.trunc(wheelAccumRef.current / threshold);
        wheelAccumRef.current -= steps * threshold;
        commitValue(valueRef.current + steps * SIZE_DIAL_STEP, true);
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, [commitValue]);

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic pointer capture errors
    }
    activePointerIdRef.current = e.pointerId;
    setIsDraggingDial(true);
    updateFromClientX(e.clientX);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    updateFromClientX(e.clientX);
  };

  const handleTrackPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    setIsDraggingDial(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore capture release errors
    }
  };

  const handleTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      commitValue(snappedValue + SIZE_DIAL_STEP, true);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      commitValue(snappedValue - SIZE_DIAL_STEP, true);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      commitValue(snappedValue + SIZE_DIAL_STEP * 3, true);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      commitValue(snappedValue - SIZE_DIAL_STEP * 3, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      commitValue(SIZE_DIAL_MIN, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      commitValue(SIZE_DIAL_MAX, true);
    }
  };

  const ratio = (snappedValue - SIZE_DIAL_MIN) / (SIZE_DIAL_MAX - SIZE_DIAL_MIN);
  const accentColor = tool === 'eraser' ? '#EC4899' : color;
  const thumbRightCss = `calc(${DOCK_ROLLER_INSET_PX}px + (100% - ${DOCK_ROLLER_INSET_PX * 2}px) * ${ratio})`;
  const realPx = sizeLevelToPx(tool, snappedValue);
  const showCallout = !suppressPreview && (isDraggingDial || isTransientPreview);

  return (
    <div
      ref={rollerRef}
      className={`apple-dock-roller ${isStandby ? 'is-standby' : ''} ${
        isDraggingDial ? 'is-dragging' : ''
      } ${isPulsing ? 'is-pulsing' : ''}`}
      style={{ '--dial-accent': accentColor } as React.CSSProperties}
    >
      {/* Floating live true-scale stroke preview while dragging or wheel-stepping */}
      <div className="apple-dock-roller-callout-anchor" aria-hidden="true">
        <AnimatePresence>
          {showCallout && (
            <motion.div
              className="apple-dock-roller-callout"
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="apple-roller-callout-stage">
                {tool === 'pen' && (
                  <span
                    className="apple-size-dot"
                    style={{
                      width: `${Math.max(2, Math.round(realPx))}px`,
                      height: `${Math.max(2, Math.round(realPx))}px`,
                      backgroundColor: color,
                    }}
                  />
                )}
                {tool === 'highlighter' && (
                  <span className="apple-callout-hl-stage">
                    <span className="apple-callout-hl-lines" />
                    <span
                      className="apple-callout-hl-bar"
                      style={{
                        height: `${Math.max(6, Math.min(26, Math.round(realPx * 0.48)))}px`,
                        backgroundColor: color,
                      }}
                    />
                  </span>
                )}
                {tool === 'laser' && (
                  <span
                    className="apple-dial-laser-dot"
                    style={{
                      width: `${Math.max(3, Math.round(realPx))}px`,
                      height: `${Math.max(3, Math.round(realPx))}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 ${Math.round(5 + ratio * 10)}px ${color}`,
                    }}
                  />
                )}
                {tool === 'eraser' && (
                  <span
                    className="apple-eraser-preview"
                    style={{
                      width: `${Math.max(9, Math.min(28, Math.round(realPx * 0.44)))}px`,
                      height: `${Math.max(9, Math.min(28, Math.round(realPx * 0.44)))}px`,
                    }}
                  />
                )}
              </div>
              <div className="apple-roller-callout-copy">
                <span className="apple-roller-callout-tool">{TOOL_SIZE_TITLES[tool]}</span>
                <span className="apple-roller-callout-pct">{toArabicDigits(snappedValue)}٪</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiet Unboxed Live Adaptive Header: [Live Tip Icon] Tool Name · 25% */}
      <div className="apple-dock-roller-head">
        <div className="apple-dock-roller-identity">
          <span className="apple-dock-roller-icon" aria-hidden="true">
            {tool === 'pen' && (
              <span
                className="apple-size-dot"
                style={{
                  width: `${Math.round(4 + ratio * 8)}px`,
                  height: `${Math.round(4 + ratio * 8)}px`,
                  backgroundColor: color,
                }}
              />
            )}
            {tool === 'highlighter' && (
              <span
                className="apple-chisel-preview"
                style={{
                  width: '12px',
                  height: `${Math.round(4 + ratio * 6)}px`,
                  backgroundColor: color,
                }}
              />
            )}
            {tool === 'laser' && (
              <span
                className="apple-dial-laser-dot"
                style={{
                  width: `${Math.round(4 + ratio * 6)}px`,
                  height: `${Math.round(4 + ratio * 6)}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 ${Math.round(3 + ratio * 6)}px ${color}`,
                }}
              />
            )}
            {tool === 'eraser' && (
              <span
                className="apple-eraser-preview"
                style={{
                  width: `${Math.round(6 + ratio * 6)}px`,
                  height: `${Math.round(6 + ratio * 6)}px`,
                }}
              />
            )}
          </span>
          <span className="apple-dock-roller-tool">{TOOL_SHORT_NAMES[tool]}</span>
        </div>

        <span className="apple-dock-roller-val" aria-live="off">
          {toArabicDigits(snappedValue)}٪
        </span>
      </div>

      {/* Silky Direct-Touch Precision Roller Groove (20 magnetic 5% stops, RTL ٥٪ -> ١٠٠٪) */}
      <div
        ref={trackRef}
        className={`apple-dock-roller-track ${isDraggingDial ? 'is-dragging' : ''}`}
        dir="rtl"
        role="slider"
        tabIndex={0}
        aria-label={`${TOOL_SIZE_TITLES[tool]} من ٥٪ إلى ١٠٠٪`}
        aria-valuemin={SIZE_DIAL_MIN}
        aria-valuemax={SIZE_DIAL_MAX}
        aria-valuenow={snappedValue}
        aria-valuetext={`${TOOL_SIZE_TITLES[tool]} ${toArabicDigits(snappedValue)} بالمئة`}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerEnd}
        onPointerCancel={handleTrackPointerEnd}
        onKeyDown={handleTrackKeyDown}
        title={
          isStandby
            ? `اضغط أو اسحب لضبط ${TOOL_SIZE_TITLES[tool]} وتفعيله فوراً (خطوة كل ٥٪)`
            : `${TOOL_SIZE_TITLES[tool]} · اضغط أو اسحب أو لفّ عجلة الماوس (كل ٥٪)`
        }
      >
        <div
          className="apple-dock-roller-fill"
          style={{ width: `calc(${thumbRightCss} + 2px)` }}
          aria-hidden="true"
        />

        <div className="apple-dock-roller-detents" aria-hidden="true">
          {DIAL_STOPS.map((stop) => {
            const stopRatio = (stop - SIZE_DIAL_MIN) / (SIZE_DIAL_MAX - SIZE_DIAL_MIN);
            const isMajor = stop === 5 || stop % 25 === 0;
            const isCovered = stop <= snappedValue;
            return (
              <span
                key={stop}
                className={`apple-dock-roller-detent ${isMajor ? 'is-major' : ''} ${
                  isCovered ? 'is-covered' : ''
                }`}
                style={{
                  right: `calc(${DOCK_ROLLER_INSET_PX}px + (100% - ${DOCK_ROLLER_INSET_PX * 2}px) * ${stopRatio})`,
                }}
              />
            );
          })}
        </div>

        <div
          className="apple-dock-roller-thumb"
          style={{ right: thumbRightCss }}
          aria-hidden="true"
        >
          <span className="apple-dock-roller-core" />
        </div>
      </div>
    </div>
  );
};

const TOOL_LABELS: Record<AnnotationTool, string> = {
  cursor: 'تصفح',
  pen: 'قلم أبل',
  highlighter: 'تظليل أبل',
  laser: 'ليزر ضوئي',
  eraser: 'ممحاة',
};

const KEYBOARD_SHORTCUT_ITEMS: ReadonlyArray<{ label: string; keys: string[] }> = [
  { label: 'تراجع خطوة', keys: ['Ctrl', 'Z'] },
  { label: 'إعادة الخطوة', keys: ['Ctrl', 'Y'] },
  { label: 'قلم أبل', keys: ['P'] },
  { label: 'تظليل أبل', keys: ['H'] },
  { label: 'مؤشر الليزر', keys: ['L'] },
  { label: 'الممحاة الذكية', keys: ['E'] },
  { label: 'وضع التصفح', keys: ['V', 'Esc'] },
  { label: 'تكبير / تصغير السُمك', keys: [']', '['] },
  { label: 'مسح الصفحة', keys: ['Ctrl', 'Shift', 'Del'] },
];

export const FloatingAnnotationPalette: React.FC = () => {
  const {
    activeTool,
    isPaletteOpen,
    penSettings,
    highlighterSettings,
    laserSettings,
    eraserSettings,
    shortcutFeedback,
  } = useAnnotationToolState();
  const { canUndo, canRedo, hasActiveStrokes } = useAnnotationDockState();
  const {
    setActiveTool,
    setPaletteOpen,
    updatePenSettings,
    updateHighlighterSettings,
    updateLaserSettings,
    updateEraserSettings,
    undo,
    redo,
    clearSurface,
  } = useAnnotationActions();

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [lastSizableTool, setLastSizableTool] = useState<SizableAnnotationTool>('pen');
  const [isRollerPulsing, setIsRollerPulsing] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dockRootRef = useRef<HTMLDivElement>(null);
  const pulseTimerRef = useRef<number | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const hasInspectorOptions =
    activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'laser';

  const triggerRollerPulse = useCallback(() => {
    setIsRollerPulsing(true);
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setIsRollerPulsing(false);
      pulseTimerRef.current = null;
    }, 360);
  }, []);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  // Remember the most recently active sizable tool so the external roller can adapt cleanly
  // and wake that tool automatically if adjusted from Browse mode.
  useEffect(() => {
    if (activeTool !== 'cursor') {
      setLastSizableTool(activeTool);
    }
  }, [activeTool]);

  // Close popovers when switching to cursor/eraser or collapsing dock
  useEffect(() => {
    if (!hasInspectorOptions || !isPaletteOpen) {
      setIsInspectorOpen(false);
    }
    if (!isPaletteOpen) {
      setIsShortcutsOpen(false);
    }
  }, [hasInspectorOptions, isPaletteOpen]);

  // Close popovers on outside pointerdown (capture phase so drawing surfaces calling stopPropagation still dismiss it) or Escape key
  useEffect(() => {
    if (!isInspectorOpen && !isShortcutsOpen) return;
    const onOutside = (e: PointerEvent) => {
      const dockEl = dockRootRef.current;
      if (!dockEl) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const isInsideDock =
        path.length > 0
          ? path.includes(dockEl)
          : Boolean(e.target instanceof Node && dockEl.contains(e.target));
      if (!isInsideDock) {
        setIsInspectorOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.key === 'Escape') {
        setIsInspectorOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('pointerdown', onOutside, { capture: true });
    window.addEventListener('keydown', onEsc, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', onOutside, { capture: true });
      window.removeEventListener('keydown', onEsc, { capture: true });
    };
  }, [isInspectorOpen, isShortcutsOpen]);

  // Keep dragged palette safely inside viewport on window resize
  useEffect(() => {
    const clampOnResize = () => {
      setDragOffset((prev) => {
        if (prev.x === 0 && prev.y === 0) return prev;
        const maxX = Math.max(0, window.innerWidth * 0.42);
        const maxUp = Math.max(0, window.innerHeight - 130);
        return {
          x: Math.max(-maxX, Math.min(maxX, prev.x)),
          y: Math.max(-maxUp, Math.min(10, prev.y)),
        };
      });
    };
    window.addEventListener('resize', clampOnResize);
    return () => window.removeEventListener('resize', clampOnResize);
  }, []);

  const handleSelectTool = (tool: AnnotationTool) => {
    setIsShortcutsOpen(false);
    if (tool === 'cursor') {
      setActiveTool('cursor');
      setIsInspectorOpen(false);
      return;
    }
    if (tool === 'eraser') {
      if (activeTool === 'eraser') {
        // Eraser thickness lives directly on the external dock roller — gently spotlight it
        triggerRollerPulse();
      } else {
        setActiveTool('eraser');
        setIsInspectorOpen(false);
      }
      return;
    }
    if (activeTool === tool) {
      // Second tap on active Pen / Highlighter / Laser toggles its color & physics inspector
      setIsInspectorOpen((prev) => !prev);
    } else {
      setActiveTool(tool);
      setIsInspectorOpen(false);
    }
  };

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: dragOffset.x,
      originY: dragOffset.y,
    };
  };

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    const maxX = Math.max(0, window.innerWidth * 0.44);
    const maxUp = Math.max(0, window.innerHeight - 120);
    setDragOffset({
      x: Math.max(-maxX, Math.min(maxX, drag.originX + dx)),
      y: Math.max(-maxUp, Math.min(12, drag.originY + dy)),
    });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragStartRef.current = null;
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
  };

  const activeAccentColor =
    activeTool === 'pen'
      ? penSettings.color
      : activeTool === 'highlighter'
      ? highlighterSettings.color
      : activeTool === 'laser'
      ? laserSettings.color
      : '#007AFF';

  const penSizeLevel = pxToSizeLevel('pen', penSettings.size);
  const highlighterSizeLevel = pxToSizeLevel('highlighter', highlighterSettings.size);
  const laserSizeLevel = pxToSizeLevel('laser', laserSettings.size);
  const eraserSizeLevel = pxToSizeLevel('eraser', eraserSettings.size);

  // External unified roller dynamically adapts to the active tool (or wakes lastSizableTool from Browse mode)
  const rollerTool: SizableAnnotationTool =
    activeTool === 'cursor' ? lastSizableTool : activeTool;

  const rollerValue =
    rollerTool === 'pen'
      ? penSizeLevel
      : rollerTool === 'highlighter'
      ? highlighterSizeLevel
      : rollerTool === 'laser'
      ? laserSizeLevel
      : eraserSizeLevel;

  const rollerColor =
    rollerTool === 'pen'
      ? penSettings.color
      : rollerTool === 'highlighter'
      ? highlighterSettings.color
      : rollerTool === 'laser'
      ? laserSettings.color
      : '#EC4899';

  const handleRollerChange = useCallback(
    (lvl: number) => {
      if (rollerTool === 'pen') {
        updatePenSettings({ size: sizeLevelToPx('pen', lvl) });
      } else if (rollerTool === 'highlighter') {
        updateHighlighterSettings({ size: sizeLevelToPx('highlighter', lvl) });
      } else if (rollerTool === 'laser') {
        updateLaserSettings({ size: sizeLevelToPx('laser', lvl) });
      } else {
        updateEraserSettings({ size: sizeLevelToPx('eraser', lvl) });
      }
    },
    [
      rollerTool,
      updatePenSettings,
      updateHighlighterSettings,
      updateLaserSettings,
      updateEraserSettings,
    ]
  );

  const hasOpenPopover = isPaletteOpen && (isInspectorOpen || isShortcutsOpen);

  return (
    <div className="apple-annotation-portal" data-annotation-ui="true" dir="rtl">
      {/* Subtle transient HUD toast when a keyboard shortcut executes */}
      <AnimatePresence>
        {shortcutFeedback && (
          <motion.div
            key={shortcutFeedback.seq}
            className={`apple-shortcut-toast ${
              hasOpenPopover ? 'is-top' : isPaletteOpen ? 'is-above-dock' : 'is-bottom'
            }`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="apple-shortcut-toast-label">{shortcutFeedback.label}</span>
            <kbd className="apple-shortcut-toast-key" dir="ltr">
              {shortcutFeedback.keycap}
            </kbd>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isPaletteOpen ? (
          <motion.button
            key="launcher"
            type="button"
            className={`apple-palette-launcher ${activeTool !== 'cursor' ? 'is-armed' : ''}`}
            onClick={() => setPaletteOpen(true)}
            title="فتح منظومة الأقلام والتظليل والليزر"
            aria-label="فتح منظومة الأقلام والتظليل والليزر"
            initial={{ opacity: 0, scale: 0.86, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={
              activeTool !== 'cursor'
                ? ({ '--armed-color': activeAccentColor } as React.CSSProperties)
                : undefined
            }
          >
            <PenTool className="w-5 h-5" strokeWidth={2.1} aria-hidden="true" />
            <span className="apple-launcher-label">الأقلام</span>
          </motion.button>
        ) : (
          <div
            key="dock"
            ref={dockRootRef}
            className={`apple-palette-anchor ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: `translate3d(calc(-50% + ${dragOffset.x}px), ${dragOffset.y}px, 0)`,
            }}
          >
            <motion.div
              className="apple-palette-motion-shell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Contextual Apple PencilKit Inspector Popover */}
              <div className="apple-inspector-anchor">
                <AnimatePresence>
                  {isInspectorOpen && hasInspectorOptions && (
                    <motion.div
                      className="apple-inspector-popover"
                      role="dialog"
                      aria-label={`إعدادات ${TOOL_LABELS[activeTool]}`}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                  <div className="apple-inspector-header">
                    <span className="apple-inspector-title">{TOOL_LABELS[activeTool]}</span>
                    <button
                      type="button"
                      className="apple-inspector-close"
                      onClick={() => setIsInspectorOpen(false)}
                      aria-label="إغلاق الإعدادات"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.3} />
                    </button>
                  </div>

                  {/* Color Swatches */}
                  {(activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'laser') && (
                    <div className="apple-inspector-section">
                      <div className="apple-swatch-row" role="group" aria-label="اختيار اللون">
                        {(activeTool === 'pen'
                          ? APPLE_PEN_COLORS
                          : activeTool === 'highlighter'
                          ? APPLE_HIGHLIGHTER_COLORS
                          : APPLE_LASER_COLORS
                        ).map((swatch) => {
                          const isSelected =
                            activeTool === 'pen'
                              ? penSettings.color === swatch.hex
                              : activeTool === 'highlighter'
                              ? highlighterSettings.color === swatch.hex
                              : laserSettings.color === swatch.hex;
                          return (
                            <button
                              key={swatch.id}
                              type="button"
                              className={`apple-swatch-btn ${isSelected ? 'is-selected' : ''}`}
                              style={{ '--swatch-hex': swatch.hex } as React.CSSProperties}
                              onClick={() => {
                                if (activeTool === 'pen') updatePenSettings({ color: swatch.hex });
                                else if (activeTool === 'highlighter')
                                  updateHighlighterSettings({ color: swatch.hex });
                                else updateLaserSettings({ color: swatch.hex });
                              }}
                              title={swatch.label}
                              aria-label={swatch.label}
                              aria-pressed={isSelected}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pen Opacity + Smoothness + Smart Shapes (Thickness lives on the external dock roller) */}
                  {activeTool === 'pen' && (
                    <>
                      <div className="apple-inspector-section">
                        <div className="apple-slider-head">
                          <span>الكثافة</span>
                          <span className="apple-slider-val">
                            {toArabicDigits(Math.round(penSettings.opacity * 100))}٪
                          </span>
                        </div>
                        <input
                          type="range"
                          className="apple-range-slider"
                          min={35}
                          max={100}
                          step={1}
                          value={Math.round(penSettings.opacity * 100)}
                          onChange={(e) =>
                            updatePenSettings({ opacity: Number(e.target.value) / 100 })
                          }
                          aria-label="كثافة حبر القلم"
                        />
                      </div>

                      <div className="apple-inspector-section">
                        <div className="apple-slider-head">
                          <span>نعومة الخط</span>
                          <span className="apple-slider-val">
                            {toArabicDigits(Math.round(penSettings.smoothing * 100))}٪
                          </span>
                        </div>
                        <input
                          type="range"
                          className="apple-range-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(penSettings.smoothing * 100)}
                          onChange={(e) =>
                            updatePenSettings({ smoothing: Number(e.target.value) / 100 })
                          }
                          aria-label="نعومة وسلاسة خط القلم"
                        />
                      </div>

                      <div className="apple-inspector-toggle-row">
                        <div className="apple-toggle-copy">
                          <span className="apple-toggle-title">ضبط الأشكال تلقائياً</span>
                          <span className="apple-toggle-sub">توقّف لحظة لضبط أي شكل أو خط منحني</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={penSettings.smartShapes}
                          className={`apple-switch ${penSettings.smartShapes ? 'is-on' : ''}`}
                          onClick={() =>
                            updatePenSettings({ smartShapes: !penSettings.smartShapes })
                          }
                        >
                          <span className="apple-switch-knob" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Highlighter Transparency + Smoothness + Horizontal Glide Assist */}
                  {activeTool === 'highlighter' && (
                    <>
                      <div className="apple-inspector-section">
                        <div className="apple-slider-head">
                          <span>الشفافية</span>
                          <span className="apple-slider-val">
                            {toArabicDigits(Math.round(highlighterSettings.opacity * 100))}٪
                          </span>
                        </div>
                        <input
                          type="range"
                          className="apple-range-slider"
                          min={20}
                          max={90}
                          step={1}
                          value={Math.round(highlighterSettings.opacity * 100)}
                          onChange={(e) =>
                            updateHighlighterSettings({ opacity: Number(e.target.value) / 100 })
                          }
                          aria-label="شفافية قلم التظليل"
                        />
                      </div>

                      <div className="apple-inspector-section">
                        <div className="apple-slider-head">
                          <span>نعومة الخط</span>
                          <span className="apple-slider-val">
                            {toArabicDigits(Math.round(highlighterSettings.smoothing * 100))}٪
                          </span>
                        </div>
                        <input
                          type="range"
                          className="apple-range-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(highlighterSettings.smoothing * 100)}
                          onChange={(e) =>
                            updateHighlighterSettings({ smoothing: Number(e.target.value) / 100 })
                          }
                          aria-label="نعومة خط التظليل"
                        />
                      </div>

                      <div className="apple-inspector-toggle-row">
                        <div className="apple-toggle-copy">
                          <span className="apple-toggle-title">استقامة وضبط الأشكال</span>
                          <span className="apple-toggle-sub">تثبيت ناعم للسطور والمنحنيات والأشكال</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={highlighterSettings.straightAssist}
                          className={`apple-switch ${highlighterSettings.straightAssist ? 'is-on' : ''}`}
                          onClick={() =>
                            updateHighlighterSettings({
                              straightAssist: !highlighterSettings.straightAssist,
                            })
                          }
                        >
                          <span className="apple-switch-knob" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Optical Laser Smoothness + Mode */}
                  {activeTool === 'laser' && (
                    <>
                      <div className="apple-inspector-section">
                        <div className="apple-slider-head">
                          <span>نعومة الخط</span>
                          <span className="apple-slider-val">
                            {toArabicDigits(Math.round(laserSettings.smoothing * 100))}٪
                          </span>
                        </div>
                        <input
                          type="range"
                          className="apple-range-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(laserSettings.smoothing * 100)}
                          onChange={(e) =>
                            updateLaserSettings({ smoothing: Number(e.target.value) / 100 })
                          }
                          aria-label="نعومة مسار الليزر"
                        />
                      </div>

                      <div className="apple-inspector-section">
                        <div className="apple-segmented" role="group" aria-label="نمط مؤشر الليزر">
                          <button
                            type="button"
                            className={`apple-seg-btn ${laserSettings.mode === 'trail' ? 'is-active' : ''}`}
                            onClick={() => updateLaserSettings({ mode: 'trail' })}
                          >
                            شعاع مع أثر متلاشٍ
                          </button>
                          <button
                            type="button"
                            className={`apple-seg-btn ${laserSettings.mode === 'dot' ? 'is-active' : ''}`}
                            onClick={() => updateLaserSettings({ mode: 'dot' })}
                          >
                            نقطة ليزر فقط
                          </button>
                        </div>
                        <p className="apple-laser-tip">
                          يبقى مسار الليزر ظاهراً كاملاً ثم يتلاشى تدريجياً عند الرفع؛ وتوقّف لحظة لضبط أي شكل أو منحنى.
                        </p>
                      </div>
                    </>
                  )}
                    </motion.div>
                  )}

                  {isShortcutsOpen && (
                    <motion.div
                      className="apple-shortcuts-popover"
                      role="dialog"
                      aria-label="اختصارات لوحة المفاتيح"
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="apple-inspector-header">
                        <span className="apple-inspector-title">اختصارات لوحة المفاتيح</span>
                        <button
                          type="button"
                          className="apple-inspector-close"
                          onClick={() => setIsShortcutsOpen(false)}
                          aria-label="إغلاق قائمة الاختصارات"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2.3} />
                        </button>
                      </div>

                      <div className="apple-shortcuts-list">
                        {KEYBOARD_SHORTCUT_ITEMS.map((item) => (
                          <div key={item.label} className="apple-shortcut-row">
                            <span className="apple-shortcut-desc">{item.label}</span>
                            <span className="apple-shortcut-keys" dir="ltr">
                              {item.keys.map((k, idx) => {
                                const isAlternative =
                                  item.label === 'وضع التصفح' ||
                                  item.label === 'تكبير / تصغير السُمك';
                                return (
                                  <React.Fragment key={k}>
                                    {idx > 0 && (
                                      <span className="apple-kbd-sep">
                                        {isAlternative ? '/' : '+'}
                                      </span>
                                    )}
                                    <kbd className="apple-kbd">{k}</kbd>
                                  </React.Fragment>
                                );
                              })}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="apple-shortcuts-note">
                        تعمل الاختصارات بلوحة المفاتيح العربية والإنجليزية تلقائياً.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            {/* Main Floating Apple PencilKit Dock */}
            <div className="apple-palette-dock" role="toolbar" aria-label="منظومة الأقلام والتظليل والليزر">
              {/* Zone 1: Drag Handle + Browse Mode */}
              <button
                type="button"
                className="apple-dock-drag-handle"
                title="اسحب لنقل شريط الأقلام · نقرتان لإعادته للمنتصف"
                aria-label="سحب شريط الأقلام"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                onDoubleClick={() => setDragOffset({ x: 0, y: 0 })}
              >
                <GripVertical className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
              </button>

              <button
                type="button"
                className={`apple-cursor-btn ${activeTool === 'cursor' ? 'is-active' : ''}`}
                aria-pressed={activeTool === 'cursor'}
                onClick={() => handleSelectTool('cursor')}
                title="وضع التصفح العادي (V / Esc)"
                aria-label="وضع التصفح العادي"
              >
                <MousePointer2 className="w-4 h-4" strokeWidth={1.95} aria-hidden="true" />
                <span className="apple-cursor-label">تصفح</span>
              </button>

              <div className="apple-dock-divider" aria-hidden="true" />

              {/* Zone 2: Illustrated Apple PencilKit Tool Nibs */}
              <div className="apple-nibs-tray" role="group" aria-label="أدوات الرسم والمؤشر">
                <button
                  type="button"
                  className={`apple-nib-slot ${activeTool === 'pen' ? 'is-active' : ''}`}
                  aria-pressed={activeTool === 'pen'}
                  onClick={() => handleSelectTool('pen')}
                  title="قلم أبل (P) · السُمك من البكرة الخارجية · اضغط مجدداً للون والنعومة"
                  aria-label="قلم أبل"
                >
                  <ApplePenNibSvg color={penSettings.color} sizeLevel={penSizeLevel} />
                </button>

                <button
                  type="button"
                  className={`apple-nib-slot ${activeTool === 'highlighter' ? 'is-active' : ''}`}
                  aria-pressed={activeTool === 'highlighter'}
                  onClick={() => handleSelectTool('highlighter')}
                  title="تظليل أبل (H) · العرض من البكرة الخارجية · اضغط مجدداً للون والشفافية"
                  aria-label="تظليل أبل"
                >
                  <AppleHighlighterNibSvg
                    color={highlighterSettings.color}
                    sizeLevel={highlighterSizeLevel}
                  />
                </button>

                <button
                  type="button"
                  className={`apple-nib-slot ${activeTool === 'laser' ? 'is-active' : ''}`}
                  aria-pressed={activeTool === 'laser'}
                  onClick={() => handleSelectTool('laser')}
                  title="مؤشر ليزر ضوئي (L) · السُمك من البكرة الخارجية · اضغط مجدداً للون والنعومة"
                  aria-label="مؤشر ليزر ضوئي"
                >
                  <AppleLaserStylusSvg
                    color={laserSettings.color}
                    sizeLevel={laserSizeLevel}
                    isActive={activeTool === 'laser'}
                  />
                </button>

                <button
                  type="button"
                  className={`apple-nib-slot ${activeTool === 'eraser' ? 'is-active' : ''}`}
                  aria-pressed={activeTool === 'eraser'}
                  onClick={() => handleSelectTool('eraser')}
                  title="ممحاة ذكية (E) · تحكّم في حجمها مباشرة من البكرة الخارجية"
                  aria-label="ممحاة ذكية"
                >
                  <AppleEraserNibSvg sizeLevel={eraserSizeLevel} />
                </button>
              </div>

              <div className="apple-dock-divider" aria-hidden="true" />

              {/* Zone 3: Active Tool Tuning (Adaptive Thickness Roller + Color Wheel) */}
              <DockThicknessRoller
                tool={rollerTool}
                isStandby={activeTool === 'cursor'}
                isPulsing={isRollerPulsing}
                suppressPreview={hasOpenPopover}
                value={rollerValue}
                color={rollerColor}
                onActivateTool={() => setActiveTool(rollerTool)}
                onChange={handleRollerChange}
              />

              <button
                type="button"
                className={`apple-dock-swatch-trigger ${isInspectorOpen ? 'is-open' : ''}`}
                disabled={!hasInspectorOptions}
                onClick={() => {
                  setIsShortcutsOpen(false);
                  setIsInspectorOpen((prev) => !prev);
                }}
                title={
                  hasInspectorOptions
                    ? 'اللون والنعومة وخيارات الأداة'
                    : activeTool === 'eraser'
                    ? 'تحكّم في حجم الممحاة مباشرة من البكرة الخارجية'
                    : 'اختر قلماً أو ليزراً لتخصيص لونه وخياراته'
                }
                aria-label="تخصيص لون وخيارات الأداة النشطة"
                aria-expanded={isInspectorOpen}
              >
                {activeTool === 'eraser' ? (
                  <SlidersHorizontal className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                ) : (
                  <span
                    className="apple-swatch-ring"
                    style={{ '--ring-color': activeAccentColor } as React.CSSProperties}
                  >
                    <span className="apple-swatch-core" />
                  </span>
                )}
              </button>

              <div className="apple-dock-divider" aria-hidden="true" />

              {/* Zone 4: History, Shortcuts & Collapse */}
              <div className="apple-dock-actions" role="group" aria-label="التراجع والمسح">
                <button
                  type="button"
                  className="apple-icon-btn"
                  disabled={!canUndo}
                  onClick={() => undo()}
                  title="تراجع خطوة (Ctrl+Z)"
                  aria-label="تراجع عن آخر خطوة"
                >
                  <Undo2 className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="apple-icon-btn"
                  disabled={!canRedo}
                  onClick={() => redo()}
                  title="إعادة الخطوة (Ctrl+Y أو Ctrl+Shift+Z)"
                  aria-label="إعادة الخطوة"
                >
                  <Redo2 className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="apple-icon-btn is-danger"
                  disabled={!hasActiveStrokes}
                  onClick={() => clearSurface()}
                  title="مسح رسومات الصفحة الحالية (Ctrl+Shift+Del)"
                  aria-label="مسح رسومات الصفحة الحالية"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                </button>
              </div>

              <div className="apple-dock-divider" aria-hidden="true" />

              <div className="apple-dock-utility" role="group" aria-label="الاختصارات والطي">
                <button
                  type="button"
                  className={`apple-icon-btn ${isShortcutsOpen ? 'is-open' : ''}`}
                  onClick={() => {
                    setIsInspectorOpen(false);
                    setIsShortcutsOpen((prev) => !prev);
                  }}
                  title="اختصارات لوحة المفاتيح"
                  aria-label="عرض اختصارات لوحة المفاتيح"
                  aria-expanded={isShortcutsOpen}
                >
                  <Keyboard className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="apple-icon-btn is-collapse"
                  onClick={() => {
                    setIsInspectorOpen(false);
                    setIsShortcutsOpen(false);
                    setPaletteOpen(false);
                  }}
                  title="طيّ شريط الأقلام"
                  aria-label="طيّ شريط الأقلام"
                >
                  <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
