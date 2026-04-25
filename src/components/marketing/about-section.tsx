import { SectionHeading } from "@/components/ui/section-heading";
import { SiteShell } from "@/components/layout/site-shell";

const values = [
  {
    title: "Elegan dan lembut",
    description:
      "Visual romantis modern dengan glassmorphism, gradient halus, dan tipografi premium yang tetap mudah dibaca.",
  },
  {
    title: "Privat dan aman",
    description:
      "Pengguna yang belum login tidak bisa melihat isi dashboard maupun konten kenangan. Hak akses dijaga tegas dari frontend sampai backend.",
  },
  {
    title: "Mudah berkembang",
    description:
      "Struktur project rapi, komponen reusable, dan dashboard admin lengkap untuk pengelolaan konten ke depannya.",
  },
];

export function AboutSection() {
  return (
    <section id="tentang" className="py-20">
      <SiteShell className="space-y-10">
        <SectionHeading
          eyebrow="Tentang Website"
          title="Ruang kenangan romantis yang hanya terbuka untuk pengguna terdaftar."
          description="Dirancang untuk menyimpan momen spesial dalam suasana yang lembut, privat, dan profesional. Semua isi konten hanya bisa diakses setelah login."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-[30px] border border-white/55 bg-white/65 p-7 shadow-[0_24px_60px_rgba(206,140,170,0.12)] backdrop-blur-xl"
            >
              <h3 className="font-display text-3xl text-rose-950">{value.title}</h3>
              <p className="mt-4 text-sm leading-8 text-rose-800/78">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </SiteShell>
    </section>
  );
}
