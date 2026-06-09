import { SidebarNav } from "./sidebar-nav";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "@/components/auth/logout-button";


interface Props {
  name: string;
  email: string;
  role: string;
  locale: string;
}

export function AdminSidebar({ name, email, role, locale }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          {/* <Sparkles className="h-4 w-4 text-pink-400 shrink-0" /> */}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              SNC Beauty
            </p>
            <p className="text-slate-400 text-[11px] leading-tight">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <SidebarNav role={role} locale={locale} />

      {/* Bottom: language + user + logout */}
      <div className="border-t border-slate-700/60 px-3 py-3 space-y-3">
        <LanguageSwitcher />

        {/* User info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-slate-200 uppercase">
              {name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate leading-none">
              {name}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{email}</p>
          </div>
        </div>

        {/* Logout button */}
        <LogoutButton
          formClassName="w-full"
          className="w-full flex items-center justify-center gap-2 rounded-lg
                     bg-slate-800 hover:bg-red-500/10
                     border border-slate-700/50 hover:border-red-500/30
                     px-3 py-2 text-xs font-medium
                     text-slate-400 hover:text-red-400
                     transition-colors duration-150"
        />
      </div>
    </aside>
  );
}
