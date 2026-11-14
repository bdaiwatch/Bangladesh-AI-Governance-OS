import React, { useEffect, useRef } from 'react';
import { Bell, Compass, Globe2, Layers, Menu, X } from 'lucide-react';
import { useGovernance } from '../../store/GovernanceContext';
import { ModuleId } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';
import { NavigationMenu } from './NavigationMenu';

export const BottomNav: React.FC<{
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}> = ({ mobileMenuOpen, onToggleMobileMenu, onCloseMobileMenu }) => {
  const {
    language,
    activeModule,
    activeSubTab,
    navigateTo,
    dataset,
    permissions,
  } = useGovernance();

  const isBn = language === 'bn';
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const getFocusable = (): HTMLElement[] => {
      const container = containerRef.current;
      if (!container) return [];
      const nodes = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter((el) => el.offsetParent !== null);
    };

    const focusTimer = window.setTimeout(() => {
      const panelFocusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (panelFocusables && panelFocusables.length > 0) {
        panelFocusables[0].focus();
      }
    }, 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseMobileMenu();
        menuButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !containerRef.current?.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !containerRef.current?.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen, onCloseMobileMenu]);

  const activeAlertsCount = dataset.watchSignals.filter(
    (w) => w.status === 'Active Alert' || w.status === 'Escalated to Risk'
  ).length;

  const navItems: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    moduleId: ModuleId;
    subTab?: string;
    badge?: number;
    isActive: boolean;
  }> = [
    {
      key: 'overview',
      label: isBn ? 'সারসংক্ষেপ' : 'Overview',
      icon: Compass,
      moduleId: 'command',
      subTab: 'overview',
      isActive: !mobileMenuOpen && activeModule === 'command' && activeSubTab === 'overview',
    },
    {
      key: 'modules',
      label: isBn ? 'মডিউল' : 'Modules',
      icon: Layers,
      moduleId: 'command',
      subTab: 'interconnections',
      isActive:
        !mobileMenuOpen &&
        ((activeModule === 'command' && activeSubTab === 'interconnections') ||
          (activeModule !== 'command' &&
            activeModule !== 'm01' &&
            activeModule !== 'observatory' &&
            activeModule !== 'm20' &&
            activeModule !== 'admin')),
    },
    {
      key: 'observatory',
      label: isBn ? 'অবজারভেটরি' : 'Observatory',
      icon: Globe2,
      moduleId: 'observatory',
      subTab: 'overview',
      isActive: !mobileMenuOpen && activeModule === 'observatory',
    },
    {
      key: 'alerts',
      label: isBn ? 'সতর্কতা' : 'Alerts',
      icon: Bell,
      moduleId: 'm01',
      subTab: 'early_warning',
      badge: activeAlertsCount,
      isActive: !mobileMenuOpen && activeModule === 'm01',
    },
  ];

  const isMenuHighlighted =
    mobileMenuOpen ||
    (activeModule === 'admin' && permissions.canAccessAdminCMS) ||
    activeModule === 'm20';

  return (
    <div ref={containerRef} className="md:hidden no-print">
      {/* Light scrim when bottom Menu drawer is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#14181B]/25"
          onClick={() => {
            onCloseMobileMenu();
            menuButtonRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}

      {/* Bottom-anchored mobile navigation drawer (opens upward from fixed bottom bar) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={isBn ? 'নেভিগেশন মেনু' : 'Navigation menu'}
          className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-40 max-h-[calc(100vh-76px)] overflow-y-auto bg-[var(--bg-surface)] border-t border-[var(--border-default)] animate-slide-up"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">
              {isBn ? 'মেনু ও সেটিংস' : 'Menu & preferences'}
            </span>
            <button
              type="button"
              onClick={() => {
                onCloseMobileMenu();
                menuButtonRef.current?.focus();
              }}
              aria-label={isBn ? 'মেনু বন্ধ করুন' : 'Close menu'}
              className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-[10px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <NavigationMenu onItemChosen={onCloseMobileMenu} />
        </div>
      )}

      {/* Fixed bottom navigation bar */}
      <nav
        aria-label={isBn ? 'নিচের নেভিগেশন বার' : 'Bottom navigation'}
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border-default)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-[58px]">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (mobileMenuOpen) onCloseMobileMenu();
                  navigateTo(item.moduleId, item.subTab);
                }}
                aria-current={item.isActive ? 'page' : undefined}
                className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-[14px] transition-colors cursor-pointer ${
                  item.isActive
                    ? 'text-[#0B5D45] dark:text-[#6EE7B7] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                {item.isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-3 right-3 h-[2px] bg-[#0B5D45] dark:bg-[#6EE7B7]"
                  />
                )}
                <span className="relative inline-flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={item.isActive ? 2.2 : 1.8} />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#0B5D45] text-white font-mono text-[10px] leading-[16px] text-center tabular-nums">
                      {formatNumberForLocale(item.badge, language)}
                    </span>
                  )}
                </span>
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-[14px] transition-colors cursor-pointer ${
              isMenuHighlighted
                ? 'text-[#0B5D45] dark:text-[#6EE7B7] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            {isMenuHighlighted && (
              <span
                aria-hidden="true"
                className="absolute top-0 left-3 right-3 h-[2px] bg-[#0B5D45] dark:bg-[#6EE7B7]"
              />
            )}
            <span className="relative inline-flex items-center justify-center">
              {mobileMenuOpen ? (
                <X className="w-[18px] h-[18px]" strokeWidth={2.2} />
              ) : (
                <Menu className="w-[18px] h-[18px]" strokeWidth={isMenuHighlighted ? 2.2 : 1.8} />
              )}
            </span>
            <span className="truncate max-w-full">{isBn ? 'মেনু' : 'Menu'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
