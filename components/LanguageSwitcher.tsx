'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {useTransition} from 'react';
import {Languages} from 'lucide-react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div className="relative inline-flex items-center group">
      <Languages className="w-4 h-4 mr-2 text-slate-500 group-hover:text-indigo-600 transition-colors" />
      <select
        defaultValue={locale}
        disabled={isPending}
        onChange={(e) => onSelectChange(e.target.value)}
        className="bg-transparent text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer outline-none appearance-none"
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        {/* Simple arrow or indicator could go here if needed */}
      </div>
    </div>
  );
}
