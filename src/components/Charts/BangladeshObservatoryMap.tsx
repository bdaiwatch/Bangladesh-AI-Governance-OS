import React, { useMemo, useState } from 'react';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_RIVERS,
  DivisionId,
  OBSERVATORY_CORRIDORS,
  ObservatoryToolNode,
  ObservatoryZoneType,
  ZONE_TYPE_META,
  polygonPathFromLonLat,
  polylinePathFromLonLat,
  projectBD,
} from '../../data/observatoryAtlas';
import { Language } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';

interface BangladeshObservatoryMapProps {
  tools: ObservatoryToolNode[];
  selectedToolId: string | null;
  onSelectTool: (tool: ObservatoryToolNode) => void;
  activeZoneType: ObservatoryZoneType | 'ALL';
  onZoneTypeChange: (zone: ObservatoryZoneType | 'ALL') => void;
  activeDivision: DivisionId | 'ALL';
  onDivisionChange: (div: DivisionId | 'ALL') => void;
  language: Language;
}

// Visual de-confliction offsets for dense Dhaka/Kaliakoir metropolitan cluster
const PIN_VISUAL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  'obs-gpu-kaliakoir': { dx: -30, dy: -24 },
  'obs-rmg-upskill': { dx: -36, dy: 6 },
  'obs-cirt-forensics': { dx: 24, dy: -24 },
  'obs-ndc-govcloud': { dx: -6, dy: -4 },
  'obs-idea-startups': { dx: 34, dy: 6 },
  'obs-naip-policy': { dx: -2, dy: 30 },
  'obs-bb-sandbox': { dx: 36, dy: 24 },
  'obs-bangla-llm': { dx: -24, dy: 26 },
  'obs-333-voice': { dx: 26, dy: 34 },
};

export const BangladeshObservatoryMap: React.FC<BangladeshObservatoryMapProps> = ({
  tools,
  selectedToolId,
  onSelectTool,
  activeZoneType,
  onZoneTypeChange,
  activeDivision,
  onDivisionChange,
  language,
}) => {
  const isBn = language === 'bn';
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);

  const visibleTools = useMemo(() => {
    return tools.filter((t) => {
      if (activeZoneType !== 'ALL' && t.zoneType !== activeZoneType) return false;
      if (activeDivision !== 'ALL' && t.divisionId !== activeDivision) return false;
      return true;
    });
  }, [tools, activeZoneType, activeDivision]);

  const hoveredTool = useMemo(
    () => tools.find((t) => t.id === hoveredToolId) || null,
    [tools, hoveredToolId]
  );

  const selectedTool = useMemo(
    () => tools.find((t) => t.id === selectedToolId) || null,
    [tools, selectedToolId]
  );

  const graticuleLons = [88.5, 89.5, 90.5, 91.5, 92.5];
  const graticuleLats = [21.5, 22.5, 23.5, 24.5, 25.5, 26.5];

  const zoneCategoryButtons: Array<{
    key: ObservatoryZoneType | 'ALL';
    labelEn: string;
    labelBn: string;
    count: number;
    color: string;
  }> = [
    {
      key: 'ALL',
      labelEn: 'All Highlighted Zones',
      labelBn: 'সকল জোন ও কেন্দ্র',
      count: tools.length,
      color: '#0B5D45',
    },
    {
      key: 'infrastructure',
      labelEn: 'AI Infrastructure Points',
      labelBn: 'এআই অবকাঠামো কেন্দ্র',
      count: tools.filter((t) => t.zoneType === 'infrastructure').length,
      color: ZONE_TYPE_META.infrastructure.color,
    },
    {
      key: 'research_hub',
      labelEn: 'Research & Innovation Hubs',
      labelBn: 'গবেষণা ও উদ্ভাবন কেন্দ্র',
      count: tools.filter((t) => t.zoneType === 'research_hub').length,
      color: ZONE_TYPE_META.research_hub.color,
    },
    {
      key: 'policy_zone',
      labelEn: 'Policy Development Zones',
      labelBn: 'নীতি ও গভর্নেন্স অঞ্চল',
      count: tools.filter((t) => t.zoneType === 'policy_zone').length,
      color: ZONE_TYPE_META.policy_zone.color,
    },
  ];

  const visibleToolCountByDivision = useMemo(() => {
    const counts: Record<DivisionId, number> = {
      rangpur: 0,
      rajshahi: 0,
      mymensingh: 0,
      sylhet: 0,
      dhaka: 0,
      khulna: 0,
      barishal: 0,
      chattogram: 0,
    };
    visibleTools.forEach((t) => {
      counts[t.divisionId] = (counts[t.divisionId] || 0) + 1;
    });
    return counts;
  }, [visibleTools]);

  return (
    <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] overflow-hidden">
      {/* Top Map Action Toolbar: 3 Zone Categories + Division Switcher */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--border-default)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-[#0B5D45] dark:text-[#6EE7B7] tracking-wider uppercase">
                {isBn ? 'জাতীয় এআই অবজারভেটরি মানচিত্র' : 'National AI Observatory Map'}
              </span>
              <span aria-hidden="true" className="text-[var(--text-secondary)]">·</span>
              <span className="text-[12px] text-[var(--text-secondary)]">
                {isBn ? 'ইন্টারেক্টিভ ভৌগোলিক বিশ্লেষণ' : 'Interactive Geospatial Atlas'}
              </span>
            </div>
            <h2 className="font-serif-editorial text-[18px] leading-[24px] font-semibold text-[var(--text-primary)] mt-0.5">
              {isBn
                ? 'বাংলাদেশের মানচিত্রে জাতীয় এআই অবকাঠামো, গবেষণা হাব ও নীতি অঞ্চল'
                : 'National AI Infrastructure Points, Research Hubs & Policy Zones'}
            </h2>
          </div>

          <div className="text-[12px] font-mono tabular-nums text-[var(--text-secondary)] shrink-0">
            {isBn
              ? `${formatNumberForLocale(visibleTools.length, language)}টি অবস্থান প্রদর্শিত`
              : `${visibleTools.length} locations highlighted`}
          </div>
        </div>

        {/* 1. Zone Category Filters (Infrastructure / Research / Policy) */}
        <div
          role="group"
          aria-label={isBn ? 'জোন ক্যাটাগরি ফিল্টার' : 'Observatory zone categories'}
          className="flex flex-wrap items-center gap-1.5"
        >
          {zoneCategoryButtons.map((btn) => {
            const isActive = activeZoneType === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => onZoneTypeChange(btn.key)}
                aria-pressed={isActive}
                className={`min-h-[40px] px-3 py-1.5 inline-flex items-center gap-2 rounded-[10px] border text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {btn.key !== 'ALL' && (
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? '#FFFFFF' : btn.color }}
                  />
                )}
                <span>{isBn ? btn.labelBn : btn.labelEn}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full font-mono text-[11px] tabular-nums ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {formatNumberForLocale(btn.count, language)}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Division / Regional Quick Selector Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--border-default)]/60 text-[12px]">
          <span className="text-[var(--text-secondary)] font-medium pr-1">
            {isBn ? 'বিভাগ নির্বাচন:' : 'Select Region:'}
          </span>
          <button
            type="button"
            onClick={() => onDivisionChange('ALL')}
            className={`min-h-[32px] px-2.5 py-0.5 rounded-[8px] border text-[12px] font-medium transition-colors cursor-pointer ${
              activeDivision === 'ALL'
                ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-[var(--text-primary)]'
                : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isBn ? 'সকল ৮টি বিভাগ' : 'All 8 Divisions'}
          </button>
          {BANGLADESH_DIVISIONS.map((div) => {
            const isDivActive = activeDivision === div.id;
            const count = visibleToolCountByDivision[div.id] || 0;
            return (
              <button
                key={div.id}
                type="button"
                onClick={() => onDivisionChange(isDivActive ? 'ALL' : div.id)}
                className={`min-h-[32px] px-2.5 py-0.5 inline-flex items-center gap-1.5 rounded-[8px] border text-[12px] font-medium transition-colors cursor-pointer ${
                  isDivActive
                    ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{isBn ? div.nameBn : div.nameEn}</span>
                <span className="font-mono text-[10px] tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartographic SVG Canvas */}
      <div className="relative bg-[#F4F5EF] dark:bg-[#121618] px-3 py-4 sm:px-6 sm:py-6 flex items-center justify-center min-h-[460px] sm:min-h-[500px]">
        <svg
          viewBox="0 0 520 620"
          className="w-full max-w-[540px] h-auto select-none overflow-visible"
          role="img"
          aria-label={
            isBn
              ? 'বাংলাদেশের মানচিত্রে জাতীয় এআই অবকাঠামো, গবেষণা হাব ও নীতি উন্নয়ন অঞ্চল'
              : 'Interactive map of Bangladesh highlighting national AI infrastructure points, research hubs, and policy development zones'
          }
        >
          {/* Lat/Lon Graticule */}
          <g className="stroke-[#DFE2D8] dark:stroke-[#23292E]" strokeWidth="0.75" strokeDasharray="3 3">
            {graticuleLons.map((lon) => {
              const p1 = projectBD(lon, 26.7);
              const p2 = projectBD(lon, 20.65);
              return <line key={`lon-${lon}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
            })}
            {graticuleLats.map((lat) => {
              const p1 = projectBD(87.95, lat);
              const p2 = projectBD(92.75, lat);
              return <line key={`lat-${lat}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
            })}
          </g>

          {/* Coordinate Labels */}
          <g className="fill-[#667085] dark:fill-[#6E7A88] font-mono text-[9px]">
            <text x="12" y="128">25.5°N</text>
            <text x="12" y="310">23.5°N</text>
            <text x="12" y="492">21.5°N</text>
            <text x="108" y="608">88.5°E</text>
            <text x="272" y="608">90.5°E</text>
            <text x="415" y="608">92.2°E</text>
          </g>

          {/* 8 Administrative Division Polygons */}
          <g>
            {BANGLADESH_DIVISIONS.map((div) => {
              const path = polygonPathFromLonLat(div.points);
              const isSelectedDiv = activeDivision === div.id;
              const isDimmed = activeDivision !== 'ALL' && !isSelectedDiv;
              const labelPos = projectBD(div.labelLonLat[0], div.labelLonLat[1]);
              const divCount = visibleToolCountByDivision[div.id] || 0;

              return (
                <g
                  key={div.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isBn ? div.nameBn : div.nameEn} (${divCount} points)`}
                  onClick={() => onDivisionChange(isSelectedDiv ? 'ALL' : div.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onDivisionChange(isSelectedDiv ? 'ALL' : div.id);
                    }
                  }}
                  className="cursor-pointer group focus:outline-none"
                >
                  <path
                    d={path}
                    className={`transition-colors duration-150 ${
                      isSelectedDiv
                        ? 'fill-[#D5EAE2] dark:fill-[#157F5E]/35 stroke-[#0B5D45] dark:stroke-[#6EE7B7]'
                        : isDimmed
                        ? 'fill-[#ECEEE7]/60 dark:fill-[#1A1F23]/60 stroke-[#D5D7CE] dark:stroke-[#2A3036]'
                        : 'fill-[#FFFFFF] dark:fill-[#1B2125] hover:fill-[#E8F3EE] dark:hover:fill-[#157F5E]/25 stroke-[#BDC4B9] dark:stroke-[#343C44]'
                    }`}
                    strokeWidth={isSelectedDiv ? 2.0 : 1.15}
                    strokeLinejoin="round"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    className={`pointer-events-none text-[10.5px] ${
                      isSelectedDiv
                        ? 'fill-[#0B5D45] dark:fill-[#6EE7B7] font-semibold'
                        : 'fill-[#475467] dark:fill-[#98A2B3] font-medium'
                    }`}
                  >
                    {isBn ? div.nameBn : div.nameEn}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 12}
                    textAnchor="middle"
                    className="pointer-events-none font-mono text-[8.5px] fill-[#667085] dark:fill-[#8A95A5] tabular-nums"
                  >
                    {formatNumberForLocale(divCount, language)}{' '}
                    {isBn ? 'পয়েন্ট' : divCount === 1 ? 'pt' : 'pts'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Major River Channels (Jamuna, Padma, Meghna) */}
          <g fill="none" className="stroke-[#BFD7E8] dark:stroke-[#274157]" strokeLinecap="round" strokeLinejoin="round">
            {BANGLADESH_RIVERS.map((riv) => (
              <path
                key={riv.id}
                d={polylinePathFromLonLat(riv.points)}
                strokeWidth="2.5"
                opacity="0.8"
                className="pointer-events-none"
              />
            ))}
          </g>

          {/* Sovereign AI Compute & Fiber Corridors */}
          <g fill="none" className="pointer-events-none">
            {OBSERVATORY_CORRIDORS.map((cor) => {
              const p1 = projectBD(cor.from[0], cor.from[1]);
              const p2 = projectBD(cor.to[0], cor.to[1]);
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2 - 14;
              return (
                <path
                  key={cor.id}
                  d={`M${p1.x},${p1.y} Q${midX},${midY} ${p2.x},${p2.y}`}
                  stroke={cor.kind === 'compute' ? '#0B5D45' : cor.kind === 'fiber' ? '#2E5E8C' : '#0F766E'}
                  strokeWidth={cor.kind === 'compute' ? 2.0 : 1.25}
                  strokeDasharray={cor.kind === 'compute' ? undefined : '4 3'}
                  opacity="0.6"
                />
              );
            })}
          </g>

          {/* Bay of Bengal Annotation */}
          <text
            x="235"
            y="555"
            textAnchor="middle"
            className="fill-[#5A7B96] dark:fill-[#6D93B2] font-serif-editorial italic text-[12px] tracking-wide pointer-events-none"
          >
            {isBn ? 'বঙ্গোপসাগর' : 'Bay of Bengal'}
          </text>

          {/* Plotted Observatory Points (Highlighted by Zone Type) */}
          <g>
            {visibleTools.map((tool) => {
              const offset = PIN_VISUAL_OFFSETS[tool.id] || { dx: 0, dy: 0 };
              const pinX = tool.x + offset.dx;
              const pinY = tool.y + offset.dy;
              const isSelected = selectedTool?.id === tool.id;
              const isHovered = hoveredToolId === tool.id;
              const zoneMeta = ZONE_TYPE_META[tool.zoneType];

              return (
                <g
                  key={tool.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isBn ? tool.nameBn : tool.nameEn} — ${zoneMeta.labelEn}`}
                  onClick={() => onSelectTool(tool)}
                  onMouseEnter={() => setHoveredToolId(tool.id)}
                  onMouseLeave={() => setHoveredToolId((prev) => (prev === tool.id ? null : prev))}
                  onFocus={() => setHoveredToolId(tool.id)}
                  onBlur={() => setHoveredToolId((prev) => (prev === tool.id ? null : prev))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTool(tool);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Leader line when offset */}
                  {(offset.dx !== 0 || offset.dy !== 0) && (
                    <line
                      x1={tool.x}
                      y1={tool.y}
                      x2={pinX}
                      y2={pinY}
                      stroke={zoneMeta.color}
                      strokeWidth="1.0"
                      opacity="0.6"
                    />
                  )}

                  {/* Concentric Halo Indicator */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={pinX}
                      cy={pinY}
                      r={isSelected ? 16 : 13}
                      fill={zoneMeta.color}
                      opacity={isSelected ? 0.2 : 0.12}
                      stroke={zoneMeta.color}
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Accessible Hit Area */}
                  <circle cx={pinX} cy={pinY} r="15" fill="transparent" />

                  {/* Distinctive Markers by Zone Type */}
                  {tool.zoneType === 'infrastructure' ? (
                    // Infrastructure: Diamond Shape
                    <polygon
                      points={`${pinX},${pinY - (isSelected ? 9 : 7)} ${pinX + (isSelected ? 9 : 7)},${pinY} ${pinX},${pinY + (isSelected ? 9 : 7)} ${pinX - (isSelected ? 9 : 7)},${pinY}`}
                      fill={zoneMeta.color}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.2 : 1.6}
                    />
                  ) : tool.zoneType === 'research_hub' ? (
                    // Research Hub: Circular Target
                    <circle
                      cx={pinX}
                      cy={pinY}
                      r={isSelected ? 8 : 6.2}
                      fill={zoneMeta.color}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.2 : 1.6}
                    />
                  ) : (
                    // Policy Zone: Shield / Hexagon Shape
                    <rect
                      x={pinX - (isSelected ? 7.5 : 5.8)}
                      y={pinY - (isSelected ? 7.5 : 5.8)}
                      width={isSelected ? 15 : 11.6}
                      height={isSelected ? 15 : 11.6}
                      rx="3"
                      fill={zoneMeta.color}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.2 : 1.6}
                    />
                  )}

                  {/* Code Tag Badge */}
                  <g transform={`translate(${pinX}, ${pinY - (isSelected ? 15 : 12)})`} className="pointer-events-none">
                    <rect
                      x="-33"
                      y="-12"
                      width="66"
                      height="14"
                      rx="4"
                      fill={isSelected ? '#14181B' : 'rgba(255,255,255,0.92)'}
                      stroke={isSelected ? zoneMeta.color : '#D0D0C8'}
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="-2.5"
                      textAnchor="middle"
                      className={`font-mono text-[8.5px] font-semibold ${
                        isSelected ? 'fill-white' : 'fill-[#14181B]'
                      }`}
                    >
                      {tool.code}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Live Hover Readout Inside Map */}
        {hoveredTool && (
          <div className="pointer-events-none absolute top-3 left-3 right-3 sm:right-auto sm:max-w-[280px] bg-[var(--bg-surface)]/95 border border-[var(--border-strong)] rounded-[10px] p-2.5 text-[12px] shadow-sm">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: ZONE_TYPE_META[hoveredTool.zoneType].color }}>
              <span>{hoveredTool.code}</span>
              <span>·</span>
              <span>{ZONE_TYPE_META[hoveredTool.zoneType].shortEn}</span>
            </div>
            <div className="font-serif-editorial text-[13px] font-semibold text-[var(--text-primary)] mt-0.5 leading-[17px]">
              {isBn ? hoveredTool.nameBn : hoveredTool.nameEn}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {isBn ? hoveredTool.locationBn : hoveredTool.locationEn}
            </div>
          </div>
        )}
      </div>

      {/* Cartographic Legend Footer */}
      <div className="px-4 sm:px-5 py-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--text-secondary)]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="font-medium text-[var(--text-primary)]">
            {isBn ? 'মানচিত্র সংকেত:' : 'Map Legend:'}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 bg-[#0B5D45] rotate-45 shrink-0" />
            <span className="font-medium text-[var(--text-primary)]">
              {isBn ? 'জাতীয় এআই অবকাঠামো' : 'National AI Infrastructure'}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0F766E] shrink-0" />
            <span className="font-medium text-[var(--text-primary)]">
              {isBn ? 'গবেষণা ও উদ্ভাবন হাব' : 'Research & Innovation Hub'}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-[3px] bg-[#2E5E8C] shrink-0" />
            <span className="font-medium text-[var(--text-primary)]">
              {isBn ? 'নীতি ও গভর্নেন্স অঞ্চল' : 'Policy Development Zone'}
            </span>
          </span>
        </div>

        <span className="font-mono text-[11px] tabular-nums">
          Click any region or point to display the detailed data sheet below
        </span>
      </div>
    </div>
  );
};
