"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageRedirect() {
  const { user, loading } = useAuth();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      const checkLanguage = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const prefLang = userDoc.data().preferredLanguage;
            if (prefLang && prefLang !== locale) {
              router.replace(pathname, { locale: prefLang });
            }
          }
        } catch (error) {
          console.error("Error checking preferred language:", error);
        }
      };
      checkLanguage();
    }
  }, [user, loading, locale, pathname, router]);

  return null;
}
