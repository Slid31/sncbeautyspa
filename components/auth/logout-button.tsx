import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

interface Props {
  className?: string;
  formClassName?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, formClassName, children }: Props) {
  return (
    <form
      className={formClassName}
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "text-sm text-slate-500 hover:text-slate-900 transition-colors"
        }
      >
        {children ?? (
          <>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </>
        )}
      </button>
    </form>
  );
}
